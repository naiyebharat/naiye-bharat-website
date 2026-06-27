"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff, X } from "lucide-react";
import { pusherClient } from "@/utils/libs/pusherClient";

type CallType = "audio" | "video";
type Role = "admin" | "advocate" | "client";

interface CallInvite {
  sosId: string;
  roomId: string;
  callType: CallType;
  from: {
    id: string;
    name: string;
    role: Role;
  };
}

interface ZegoCallWidgetProps {
  sosId?: string | null;
  user: {
    id: string;
    name: string;
    role: Role;
  } | null;
  peerLabel?: string;
  compact?: boolean;
}

export default function ZegoCallWidget({ sosId, user, peerLabel = "SOS party", compact = false }: ZegoCallWidgetProps) {
  const [incomingCall, setIncomingCall] = useState<CallInvite | null>(null);
  const [activeCall, setActiveCall] = useState<CallInvite | null>(null);
  const [joining, setJoining] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff((prev) => !prev);
    }
  };
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const pendingSignals = useRef<{ signal: any; from: { id: string } }[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<CallType | null>(null);

  const roomId = useMemo(() => (sosId ? `sos_${sosId.replace(/[^a-zA-Z0-9_-]/g, "")}` : ""), [sosId]);
  const isCaller = useRef(false);

  const handleWebRTCSignal = async (signal: any, from: { id: string }) => {
    const pc = pcRef.current;
    if (!pc) return;

    try {
      if (signal.sdp) {
        if (signal.sdp.type === "offer") {
          if (pc.signalingState === "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await axios.post("/api/sos/call", {
              sosId,
              action: "signal",
              roomId: signal.roomId || roomId,
              signal: { sdp: pc.localDescription },
            });
          } else {
            console.warn("Received offer but signalingState is not stable:", pc.signalingState);
          }
        } else if (signal.sdp.type === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else {
            console.warn("Received answer but signalingState is not have-local-offer:", pc.signalingState);
          }
        }

        // Process queued ICE candidates
        while (pendingCandidates.current.length > 0) {
          const cand = pendingCandidates.current.shift();
          if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => undefined);
        }
      } else if (signal.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => undefined);
        } else {
          pendingCandidates.current.push(signal.candidate);
        }
      }
    } catch (err) {
      console.error("WebRTC signal handling failed:", err);
    }
  };

  // Initialize WebRTC connection
  const setupPeerConnection = async (callType: CallType, inviteRoomId: string) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pcRef.current = pc;

    // Send local tracks
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(() => undefined);
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (err: any) {
      console.error("Local media capture failed:", err);
      setErrorText("Could not access camera/microphone.");
    }

    // Ice candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate && sosId) {
        axios.post("/api/sos/call", {
          sosId,
          action: "signal",
          roomId: inviteRoomId,
          signal: { candidate: event.candidate },
        }).catch(() => undefined);
      }
    };

    // Receive remote tracks
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => undefined);
        setIsCallConnected(true);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setIsCallConnected(true);
      }
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        void leaveCall();
      }
    };

    // Process any queued signals
    if (pendingSignals.current.length > 0) {
      const queued = [...pendingSignals.current];
      pendingSignals.current = [];
      for (const item of queued) {
        await handleWebRTCSignal(item.signal, item.from);
      }
    }

    return pc;
  };

  useEffect(() => {
    if (!sosId || !user) return;

    const channel = pusherClient.subscribe(`sos-${sosId}`);
    
    channel.bind("call-invite", (invite: CallInvite) => {
      if (String(invite.from?.id) === String(user.id)) return;
      setIncomingCall(invite);
    });

    channel.bind("call-accepted", async (data: CallInvite) => {
      if (String(data.from.id) === String(user.id)) return;
      
      // If we are the caller, we initiate the WebRTC offer when accepted
      if (isCaller.current && pcRef.current) {
        if (pcRef.current.signalingState !== "stable") {
          console.warn("Signaling state is not stable, ignoring duplicate call-accepted. State:", pcRef.current.signalingState);
          return;
        }
        try {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          await axios.post("/api/sos/call", {
            sosId,
            action: "signal",
            roomId: data.roomId,
            signal: { sdp: pcRef.current.localDescription },
          });
        } catch (err) {
          console.error("Offer creation failed:", err);
        }
      }
    });

    channel.bind("webrtc-signal", async (data: { signal: any; from: { id: string } }) => {
      if (String(data.from.id) === String(user.id)) return;
      if (!pcRef.current) {
        pendingSignals.current.push(data);
        return;
      }
      await handleWebRTCSignal(data.signal, data.from);
    });

    channel.bind("call-ended", () => {
      void leaveCall();
      setIncomingCall(null);
    });

    return () => {
      pusherClient.unsubscribe(`sos-${sosId}`);
    };
  }, [sosId, user?.id, roomId]);

  const handleStartCallClick = (callType: CallType) => {
    setPendingCallType(callType);
    setShowConfirmModal(true);
  };

  const confirmStartCall = async () => {
    if (!pendingCallType) return;
    const type = pendingCallType;
    setShowConfirmModal(false);
    setPendingCallType(null);
    await startCall(type);
  };

  const startCall = async (callType: CallType) => {
    if (!sosId || !user || !roomId) return;
    setErrorText("");
    isCaller.current = true;

    try {
      const res = await axios.post("/api/sos/call", { sosId, action: "invite", callType, roomId });
      const invite: CallInvite = {
        sosId,
        roomId: res.data.roomId || roomId,
        callType,
        from: user,
      };
      
      setActiveCall(invite);
      await setupPeerConnection(callType, invite.roomId);
    } catch (err) {
      console.error("Failed to start call:", err);
      setErrorText("Could not initiate call.");
    }
  };

  const acceptCall = async (invite: CallInvite) => {
    if (!user) return;
    setJoining(true);
    setErrorText("");
    isCaller.current = false;

    try {
      setActiveCall(invite);
      setIncomingCall(null);

      await setupPeerConnection(invite.callType, invite.roomId);

      await axios.post("/api/sos/call", {
        sosId: invite.sosId,
        action: "accept",
        callType: invite.callType,
        roomId: invite.roomId,
      });
    } catch (error: any) {
      console.error("Accept call failed:", error);
      setErrorText("Could not join WebRTC call.");
    } finally {
      setJoining(false);
    }
  };

  const leaveCall = async () => {
    isCaller.current = false;
    pendingCandidates.current = [];
    pendingSignals.current = [];
    setIsCallConnected(false);
    setIsMicMuted(false);
    setIsCameraOff(false);


    // Stop streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setActiveCall(null);
  };

  const endCall = async () => {
    if (sosId && activeCall) {
      await axios.post("/api/sos/call", {
        sosId,
        action: "end",
        callType: activeCall.callType,
        roomId: activeCall.roomId,
      }).catch(() => undefined);
    }
    await leaveCall();
  };

  const LogoSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,2" />
      <rect x="47" y="25" width="6" height="45" fill="#d4af37" />
      <rect x="40" y="65" width="20" height="8" rx="4" fill="#d4af37" />
      <rect x="44" y="20" width="12" height="6" rx="3" fill="#d4af37" />
      <rect x="30" y="35" width="40" height="3" fill="#d4af37" />
      <circle cx="38" cy="40" r="2" fill="#d4af37" />
      <line x1="38" y1="42" x2="38" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="32" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="44" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 30 48 Q 38 55 46 48 L 46 52 Q 38 59 30 52 Z" fill="#d4af37" />
      <circle cx="62" cy="40" r="2" fill="#d4af37" />
      <line x1="62" y1="42" x2="62" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="56" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="68" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 54 48 Q 62 55 70 48 L 70 52 Q 62 59 54 52 Z" fill="#d4af37" />
    </svg>
  );

  if (!sosId || !user) return null;

  return (
    <>
      <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
        <button
          type="button"
          onClick={() => handleStartCallClick("audio")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-800 dark:bg-[#0b1329] dark:text-slate-300"
        >
          <Mic className="h-3.5 w-3.5" />
          {!compact && "Voice"}
        </button>
        <button
          type="button"
          onClick={() => handleStartCallClick("video")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-700 dark:bg-[#00c2a8] dark:text-[#050b1d]"
        >
          <Video className="h-3.5 w-3.5" />
          {!compact && "Video"}
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-[#0b1329]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Confirm Outgoing Call
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Are you sure you want to start a {pendingCallType} call with {peerLabel}?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingCallType(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStartCall}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 dark:bg-[#00c2a8] dark:text-[#050b1d]"
              >
                Call
              </button>
            </div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-[#0b1329]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-[#00c2a8]">
              {incomingCall.callType === "video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
            </div>
            <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Incoming {incomingCall.callType} call
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {incomingCall.from.name} wants to speak with you about this SOS.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIncomingCall(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => acceptCall(incomingCall)}
                disabled={joining}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-[#00c2a8] dark:text-[#050b1d]"
              >
                {joining ? "Joining" : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <div className="fixed inset-0 z-[90] flex flex-col justify-between bg-slate-950 overflow-hidden select-none">
          {/* Main Remote Video (Fullscreen Background) */}
          <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 h-full w-full object-cover ${isCallConnected ? "block" : "hidden"}`}
            />
            
            {/* Ringing / Connecting Overlay */}
            {!isCallConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center z-10">
                {user.role === "client" ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-24 w-24 rounded-full bg-emerald-500/20 animate-ping" />
                      <div className="absolute h-28 w-28 rounded-full border border-emerald-500/30 animate-pulse" />
                      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d4af37] bg-slate-900 p-3 shadow-xl">
                        <LogoSVG />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">NaiyeBharat</h4>
                      <p className="mt-2 text-[10px] font-bold text-emerald-400 tracking-widest uppercase animate-pulse flex items-center gap-1.5 justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        ringing
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-24 w-24 rounded-full bg-amber-500/20 animate-ping" />
                      <div className="absolute h-28 w-28 rounded-full border border-amber-500/30 animate-pulse" />
                      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d4af37] bg-slate-900 shadow-xl">
                        <span className="text-3xl font-black text-[#d4af37]">
                          {(peerLabel || "Client").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{peerLabel || "Client"}</h4>
                      <p className="mt-2 text-[10px] font-bold text-amber-400 tracking-widest uppercase animate-pulse flex items-center gap-1.5 justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                        ringing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remote Label (when connected) */}
            {isCallConnected && (
              <div className="absolute bottom-28 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-200 z-10 border border-slate-800">
                {peerLabel} (Active)
              </div>
            )}
          </div>

          {/* Floating Local Video (Top-Right) */}
          <div className="absolute top-6 right-6 w-28 h-40 rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl z-20">
            {activeCall.callType === "video" && !isCameraOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  <VideoOff className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">You</span>
              </div>
            )}
            
            {/* Small Overlay Label */}
            <div className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-300">
              You
            </div>
          </div>

          {/* Call Header Metadata (Top-Left) */}
          <div className="absolute top-6 left-6 z-10 bg-slate-950/60 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl max-w-[200px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37]">
              {activeCall.callType === "video" ? "Video Session" : "Voice Session"}
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">Room: {activeCall.roomId}</p>
          </div>

          {/* Bottom Bar Controls (Camera, Mic, End Call) */}
          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-6">
            {/* Camera Toggle Button */}
            {activeCall.callType === "video" && (
              <button
                type="button"
                onClick={toggleCamera}
                className={`flex h-14 w-14 items-center justify-center rounded-full border border-slate-700/50 backdrop-blur-md transition-all ${
                  isCameraOff ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-slate-900/80 text-white hover:bg-slate-800"
                }`}
              >
                {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </button>
            )}

            {/* End Call Button */}
            <button
              type="button"
              onClick={endCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all hover:scale-105"
            >
              <PhoneOff className="h-6 w-6" />
            </button>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`flex h-14 w-14 items-center justify-center rounded-full border border-slate-700/50 backdrop-blur-md transition-all ${
                isMicMuted ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-slate-900/80 text-white hover:bg-slate-800"
              }`}
            >
              {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>

          {errorText && (
            <div className="absolute bottom-28 left-4 right-4 text-center z-10">
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-block">
                {errorText}
              </span>
            </div>
          )}
        </div>
      )}


      {errorText && !activeCall && (
        <div className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-xl border border-red-200 bg-white p-4 text-xs font-bold text-red-600 shadow-xl dark:border-red-900/40 dark:bg-[#0b1329]">
          <X className="h-4 w-4 flex-shrink-0" />
          {errorText}
        </div>
      )}
    </>
  );
}
