"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Mic, Phone, PhoneOff, Video, X } from "lucide-react";
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
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<CallType | null>(null);

  const roomId = useMemo(() => (sosId ? `sos_${sosId.replace(/[^a-zA-Z0-9_-]/g, "")}` : ""), [sosId]);
  const isCaller = useRef(false);

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
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        void leaveCall();
      }
    };

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
      const pc = pcRef.current;
      const { signal } = data;

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
                roomId: data.signal?.roomId || roomId,
                signal: { sdp: pc.localDescription },
              });
            }
          } else if (signal.sdp.type === "answer") {
            if (pc.signalingState === "have-local-offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
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
      await axios.post("/api/sos/call", {
        sosId: invite.sosId,
        action: "accept",
        callType: invite.callType,
        roomId: invite.roomId,
      });

      setActiveCall(invite);
      setIncomingCall(null);

      await setupPeerConnection(invite.callType, invite.roomId);
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-lg">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {activeCall.callType === "video" ? "Video Call" : "Voice Call"}
                </h3>
                <p className="text-xs font-semibold text-slate-400">Room connected with {peerLabel}</p>
              </div>
              <button type="button" onClick={endCall} className="rounded-xl bg-red-600 p-3 text-white hover:bg-red-700">
                <PhoneOff className="h-4 w-4" />
              </button>
            </div>

            <div className="grid min-h-[360px] grid-cols-1 gap-3 p-4 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[320px] w-full object-cover" />
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Remote
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <video ref={localVideoRef} autoPlay playsInline muted className="h-full min-h-[320px] w-full object-cover" />
                {activeCall.callType === "audio" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <Phone className="h-8 w-8" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  You
                </div>
              </div>
            </div>
            {errorText && <div className="border-t border-slate-800 px-5 py-3 text-xs font-bold text-red-400">{errorText}</div>}
          </div>
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
