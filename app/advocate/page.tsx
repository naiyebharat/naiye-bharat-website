// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { pusherClient } from "@/utils/libs/pusherClient";
import ProfileHeader from "./components/ProfileHeader";
import RequestList, { ClientRequest } from "./components/RequestList";
import ChatArea from "./components/ChatArea";
import LogoutModal from "./components/LogoutModal";
import ThemeToggle from "./components/ThemeToggle";
import Toast, { ToastData } from "./components/Toast";
import ZegoCallWidget from "@/components/ZegoCallWidget";
import useUserStore from "@/store/UserStore";
import useThemeStore from "@/store/ThemeStore";
import { Loader2 } from "lucide-react";
import SOSWorkspace from "./components/SOSWorkspace";
import IncomingSOSAlert from "./components/IncomingSOSAlert";

// Haversine distance calculator helper
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns distance in km
}

export default function AdvocateDashboardPage() {
  const { theme, toggleTheme, setTheme: setStoreTheme } = useThemeStore();
  const { user, setUser } = useUserStore();

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [toast, setToast] = useState<ToastData>({ show: false, title: "", message: "", type: "info" });
  const [advocateProfile, setAdvocateProfile] = useState<any | null>(null);

  // Status Change Confirmation States
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"offline" | "available" | "busy" | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);

  // SOS States
  const [sosStatus, setSosStatus] = useState<"offline" | "available" | "busy">("offline");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 }); // Delhi defaults
  
  // Real-time Incoming SOS Popup Alert
  const [incomingSOS, setIncomingSOS] = useState<any | null>(null);

  // Active SOS engagement
  const [activeSOS, setActiveSOS] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"consultation" | "sos">("consultation");

  // SOS History (completed/cancelled)
  const [sosHistory, setSosHistory] = useState<any[]>([]);
  const [sosHistoryLoading, setSosHistoryLoading] = useState(false);
  const [selectedHistorySOS, setSelectedHistorySOS] = useState<any | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"consultation" | "sos" | "history">("consultation");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mock call states
  const [activeCall, setActiveCall] = useState<{ isOpen: boolean; type: "audio" | "video" | null; state: "dialing" | "connected" | "ended" }>({
    isOpen: false,
    type: null,
    state: "dialing",
  });
  const [callTimer, setCallTimer] = useState(0);

  // Simulated movement state
  const [isSimulatingTravel, setIsSimulatingTravel] = useState(false);
  const travelTimerRef = useRef<any>(null);

  // Consultation Rooms state
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [activeClient, setActiveClient] = useState<ClientRequest | null>(null);
  const [isConsultationChatOpen, setIsConsultationChatOpen] = useState(false);

  const fetchRequestPipeline = useCallback(async (isInitial = false) => {
    if (isInitial) setRoomsLoading(true);
    try {
      const [roomsRes, sosRes] = await Promise.all([
        axios.get("/api/advocate/rooms"),
        axios.get("/api/advocate/pending-sos"),
      ]);

      const consultationRooms = (roomsRes.data?.success ? roomsRes.data.data : []).map((room: ClientRequest) => ({
        ...room,
        requestType: "consultation",
      }));
      const pendingSOS = sosRes.data?.success ? sosRes.data.data : [];

      setRequests([...pendingSOS, ...consultationRooms]);
    } catch (err) {
      console.error("Request pipeline fetch error:", err);
      triggerToast("Sync Failed", "Could not load latest client requests.", "error");
    } finally {
      if (isInitial) setRoomsLoading(false);
    }
  }, []);

  // Fetch dynamic profile details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.user) {
          setAdvocateProfile(res.data.user);
          setUser(res.data.user);
          // Check if lawyer has an active SOS from DB
          checkActiveSOS();
          fetchRequestPipeline(true);
          fetchSOSHistory();
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    }
    fetchProfile();
  }, [fetchRequestPipeline, setUser]);

  useEffect(() => {
    if (!advocateProfile) return;

    const interval = setInterval(() => fetchRequestPipeline(false), 5000);
    return () => clearInterval(interval);
  }, [advocateProfile, fetchRequestPipeline]);

  // Check active SOS from DB and load its chat history
  const checkActiveSOS = async () => {
    try {
      const res = await axios.get("/api/advocate/active-sos");
      if (res.data.success && res.data.activeSOS) {
        setActiveSOS(res.data.activeSOS);
        setSosStatus("busy");
        // Load persisted chat messages from DB
        try {
          const chatRes = await axios.get(`/api/sos/chat?sosId=${res.data.activeSOS._id}`);
          if (chatRes.data.success && chatRes.data.messages) {
            setMessages(chatRes.data.messages);
          }
        } catch (chatErr) {
          console.error("Failed to load SOS chat history:", chatErr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch completed SOS history for this advocate
  const fetchSOSHistory = async () => {
    setSosHistoryLoading(true);
    try {
      const res = await axios.get("/api/advocate/sos-history");
      if (res.data.success) {
        setSosHistory(res.data.history || []);
      }
    } catch (err) {
      console.error("SOS history fetch error:", err);
    } finally {
      setSosHistoryLoading(false);
    }
  };

  // Sync state layout adjustments directly into root HTML layers
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const triggerToast = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ show: true, title, message, type });
  };

  // Periodic coordinates fetcher & reporting when online
  useEffect(() => {
    let watchId: any;
    if (sosStatus === "available" || sosStatus === "busy") {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCurrentCoords({ lat, lng });

            // Post to backend
            axios.post("/api/advocate/update-location", {
              lat,
              lng,
              sosStatus,
            }).catch(err => console.error("Failed to update coordinates:", err));
          },
          (error) => {
            console.error("GPS Watch failed, using default coordinates:", error);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [sosStatus]);

  // Keep refs in sync for pusher handlers to avoid constant unsubscribe/resubscribe
  const sosStatusRef = useRef(sosStatus);
  const currentCoordsRef = useRef(currentCoords);

  useEffect(() => {
    sosStatusRef.current = sosStatus;
  }, [sosStatus]);

  useEffect(() => {
    currentCoordsRef.current = currentCoords;
  }, [currentCoords]);

  // Subscribe to global lawyers and specific active SOS pusher channels
  useEffect(() => {
    if (!advocateProfile) return;

    // 1. Subscribe to "lawyers" general channel for new SOS broadcasts
    const lawyersChannel = pusherClient.subscribe("lawyers");

    lawyersChannel.bind("new-sos", (data: any) => {
      // Only show popup alert if lawyer is available & targeted
      if (sosStatusRef.current === "available") {
        const targetLawyers = data.targetLawyers || [];
        if (targetLawyers.length === 0 || targetLawyers.includes(advocateProfile.id)) {
          // Calculate distance to client
          const dist = calculateDistance(currentCoordsRef.current.lat, currentCoordsRef.current.lng, data.lat, data.lng);

          setRequests((prev) => {
            if (prev.some((req) => req.sosId === data.sosId || req.id === data.sosId)) return prev;
            const sosRequest: ClientRequest = {
              id: data.sosId,
              sosId: data.sosId,
              requestType: "sos",
              name: "Emergency Client",
              issue: data.emergencyType || "Emergency Legal Assistance",
              lastMessage: `SOS payout Rs ${data.payout || 3600}`,
              lastMessageTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
              status: "pending_expert",
              isAssigned: false,
              payout: data.payout || 3600,
              lat: data.lat,
              lng: data.lng,
            };
            return [sosRequest, ...prev];
          });

          setIncomingSOS({
            sosId: data.sosId,
            emergencyType: data.emergencyType,
            clientLocation: { lat: data.lat, lng: data.lng },
            distance: dist.toFixed(1),
            payout: data.payout || 3600,
          });
        }
      }
    });

    // 2. Subscribe to specific lawyer dashboard updates
    const selfChannel = pusherClient.subscribe(`lawyer-sos-${advocateProfile.id}`);
    
    selfChannel.bind("sos-assigned", (data: any) => {
      triggerToast("Assigned SOS", "You have been assigned to an emergency SOS. Support page opened.", "success");
      checkActiveSOS();
    });

    selfChannel.bind("sos-unassigned", (data: any) => {
      triggerToast("SOS Cancelled", "This SOS request was reassigned to another advocate by Admin.", "info");
      setActiveSOS(null);
      setSosStatus("available");
    });

    return () => {
      pusherClient.unsubscribe("lawyers");
      pusherClient.unsubscribe(`lawyer-sos-${advocateProfile.id}`);
    };
  }, [advocateProfile?.id]);

  // Subscribe to specific SOS channel messages/updates when active
  useEffect(() => {
    if (!activeSOS) return;

    const sosChannel = pusherClient.subscribe(`sos-${activeSOS._id}`);

    sosChannel.bind("status-update", (data: any) => {
      if (data.status) {
        setActiveSOS((prev) => prev ? { ...prev, status: data.status } : null);
        if (data.status === "completed" || data.status === "cancelled") {
          // Brief delay so advocate sees the final status before workspace closes
          setTimeout(() => {
            setActiveSOS(null);
            setMessages([]);
            setSosStatus("available");
            // Refresh history so the completed SOS appears
            fetchSOSHistory();
          }, 2000);
        }
      }
    });

    sosChannel.bind("chat-message", (msg: any) => {
      setMessages((prev) => {
        // Deduplicate by id if present
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      pusherClient.unsubscribe(`sos-${activeSOS._id}`);
    };
  }, [activeSOS?._id]);


  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (activeCall.isOpen && activeCall.state === "connected") {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeCall.isOpen, activeCall.state]);

  const startCall = (type: "audio" | "video") => {
    setActiveCall({ isOpen: true, type, state: "dialing" });
    setTimeout(() => {
      setActiveCall((prev) => (prev.isOpen ? { ...prev, state: "connected" } : prev));
    }, 2500);
  };

  const endCall = () => {
    setActiveCall((prev) => ({ ...prev, state: "ended" }));
    setTimeout(() => {
      setActiveCall({ isOpen: false, type: null, state: "dialing" });
    }, 1000);
  };

  const handleStatusChangeClick = (newStatus: "offline" | "available" | "busy") => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    const nextStatus = pendingStatus;
    setShowStatusConfirm(false);
    setPendingStatus(null);
    setStatusChanging(true);
    try {
      setSosStatus(nextStatus);
      await axios.post("/api/advocate/update-location", {
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        sosStatus: nextStatus,
      });
      triggerToast("Status Updated", `Your SOS availability status is now ${nextStatus.toUpperCase()}`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Update Failed", "Could not synchronize status with server", "error");
    } finally {
      setStatusChanging(false);
    }
  };

  // Accept incoming SOS
  const handleAcceptSOS = async () => {
    if (!incomingSOS) return;
    try {
      const res = await axios.post("/api/sos/accept", {
        sosId: incomingSOS.sosId,
      });

      if (res.data.success) {
        triggerToast("SOS Assigned", "You successfully accepted the emergency response", "success");
        setIncomingSOS(null);
        setRequests((prev) => prev.filter((req) => req.sosId !== incomingSOS.sosId && req.id !== incomingSOS.sosId));
        checkActiveSOS();
      } else {
        triggerToast("Already Handled", res.data.message || "This request was accepted by another lawyer", "warning");
        setIncomingSOS(null);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Accept Error", "Failed to register acceptance", "error");
      setIncomingSOS(null);
    }
  };

  // Update travel journey status
  const handleUpdateSOSStatus = async (status: string) => {
    if (!activeSOS) return;
    try {
      const res = await axios.post("/api/sos/update-status", {
        sosId: activeSOS._id,
        status,
      });
      if (res.data.success) {
        setActiveSOS((prev) => prev ? { ...prev, status } : null);
        triggerToast("Status Updated", `Emergency status updated to: ${status.replace("_", " ")}`, "success");
        if (status === "completed" || status === "cancelled") {
          setTimeout(() => {
            setActiveSOS(null);
            setMessages([]);
            setSosStatus("available");
            fetchSOSHistory();
          }, 2000);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("Update Failed", "Could not sync journey status", "error");
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeSOS || !advocateProfile) return;

    try {
      await axios.post("/api/sos/chat", {
        sosId: activeSOS._id,
        senderType: "expert",
        senderName: advocateProfile.name,
        text: newMessageText.trim(),
      });
      setNewMessageText("");
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate travel motion controls
  const toggleSimulateTravel = () => {
    if (isSimulatingTravel) {
      clearInterval(travelTimerRef.current);
      setIsSimulatingTravel(false);
    } else {
      if (!activeSOS) return;
      setIsSimulatingTravel(true);

      const targetLat = activeSOS.clientLocation.coordinates[1];
      const targetLng = activeSOS.clientLocation.coordinates[0];

      // Interpolate movement towards target client location
      travelTimerRef.current = setInterval(async () => {
        setCurrentCoords((prev) => {
          const latDiff = targetLat - prev.lat;
          const lngDiff = targetLng - prev.lng;
          
          // Steps of 10%
          const stepLat = prev.lat + latDiff * 0.15;
          const stepLng = prev.lng + lngDiff * 0.15;

          // Check if arrived
          if (Math.abs(latDiff) < 0.0002 && Math.abs(lngDiff) < 0.0002) {
            clearInterval(travelTimerRef.current);
            setIsSimulatingTravel(false);
            // Auto trigger arrived update
            handleUpdateSOSStatus("arrived");
            return { lat: targetLat, lng: targetLng };
          }

          // Trigger update to backend
          axios.post("/api/advocate/update-location", {
            lat: stepLat,
            lng: stepLng,
            sosStatus: "busy",
          }).catch(console.error);

          return { lat: stepLat, lng: stepLng };
        });
      }, 3000);
    }
  };

  // Confirm logout
  const handleConfirmLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLogoutOpen(false);
    }
  };

  if (!theme) return <div className="min-h-screen w-full bg-[#050b1d]" />;

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-[#050b1d] overflow-hidden select-none transition-colors duration-300">
      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleConfirmLogout} />

      {showStatusConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-[#0b1329]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Confirm Status Change
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Are you sure you want to change your SOS status to <span className="font-extrabold text-amber-600 dark:text-[#00c2a8] uppercase">{pendingStatus}</span>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowStatusConfirm(false);
                  setPendingStatus(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 dark:bg-[#00c2a8] dark:text-[#050b1d]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTIVE EMERGENCY OVERLAY DASHBOARD --- */}
      {activeSOS ? (
        <SOSWorkspace
          activeSOS={activeSOS}
          currentCoords={currentCoords}
          messages={messages}
          newMessageText={newMessageText}
          isChatOpen={isChatOpen}
          isSimulatingTravel={isSimulatingTravel}
          advocateProfile={advocateProfile}
          chatEndRef={chatEndRef}
          onSendMessage={handleSendMessage}
          onMessageChange={setNewMessageText}
          onUpdateSOSStatus={handleUpdateSOSStatus}
          onToggleSimulateTravel={toggleSimulateTravel}
          calculateDistance={calculateDistance}
        />
      ) : null}

      {/* --- INCOMING SOS POPUP TRIGGER MODAL --- */}
      {incomingSOS && (
        <IncomingSOSAlert
          incomingSOS={incomingSOS}
          onAccept={handleAcceptSOS}
          onReject={() => setIncomingSOS(null)}
        />
      )}

      {/* --- STANDARD CONSULTATION VIEW WORKSPACE --- */}
      {!activeSOS && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Profile Header */}
          <ProfileHeader
            theme={theme || "light"}
            onToggleTheme={handleToggleTheme}
            onLogoutClick={() => setIsLogoutOpen(true)}
            advocateName={advocateProfile?.name || "Advocate"}
          />

          {/* SOS Status Control Panel / Sub-Bar */}
          <div className="bg-slate-50 dark:bg-[#070d1e] border-b border-slate-200 dark:border-slate-900 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                SOS Dispatch Mode:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  sosStatus === "available" ? "bg-emerald-500 animate-pulse" :
                  sosStatus === "busy" ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                }`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {sosStatus}
                </span>
              </div>
            </div>

            {/* SOS Mode Selector */}
            <div className="flex items-center bg-slate-200/50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
              <button
                disabled={statusChanging}
                onClick={() => handleStatusChangeClick("offline")}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all disabled:opacity-50 ${
                  sosStatus === "offline"
                    ? "bg-slate-300 dark:bg-slate-850 text-slate-950 dark:text-white font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Offline
              </button>
              <button
                disabled={statusChanging}
                onClick={() => handleStatusChangeClick("available")}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                  sosStatus === "available"
                    ? "bg-green-600 text-white font-black animate-none"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Available
              </button>
              <button
                disabled={statusChanging}
                onClick={() => handleStatusChangeClick("busy")}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all disabled:opacity-50 ${
                  sosStatus === "busy"
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Busy
              </button>
            </div>

            {/* Active Spinner */}
            <div className="w-16 flex justify-end">
              {statusChanging && (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-[#00c2a8]" />
              )}
            </div>
          </div>

          {/* Regular Client list & chat split */}
          <div className="flex-1 flex overflow-hidden w-full relative">
            {/* Left sidebar - Room lists */}
            <div className={`w-full md:w-85 lg:w-96 h-full flex-shrink-0 bg-white dark:bg-[#070d1e] border-r border-slate-200 dark:border-slate-900 ${isConsultationChatOpen || selectedHistorySOS ? "hidden md:flex" : "flex"} flex-col`}>
              {/* 3-Tab Strip */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800/65 flex gap-1.5 bg-slate-50 dark:bg-[#050b1d]">
                <button
                  type="button"
                  onClick={() => { setSidebarTab("consultation"); setActiveTab("consultation"); setActiveClient(null); setSelectedHistorySOS(null); }}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${
                    sidebarTab === "consultation"
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                      : "bg-white dark:bg-[#0b1329] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Consults
                </button>
                <button
                  type="button"
                  onClick={() => { setSidebarTab("sos"); setActiveTab("sos"); setActiveClient(null); setSelectedHistorySOS(null); }}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center justify-center gap-1 ${
                    sidebarTab === "sos"
                      ? "bg-red-600 text-white border-red-600 shadow-md"
                      : "bg-white dark:bg-[#0b1329] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:text-red-500 dark:hover:text-red-400"
                  }`}
                >
                  SOS
                  {requests.some((r) => r.requestType === "sos") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setSidebarTab("history"); setActiveClient(null); setIsConsultationChatOpen(false); }}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${
                    sidebarTab === "history"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white dark:bg-[#0b1329] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  History
                  {sosHistory.length > 0 && (
                    <span className="ml-1 text-[8px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-black">{sosHistory.length}</span>
                  )}
                </button>
              </div>

              {/* SOS History List */}
              {sidebarTab === "history" ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-premium">
                  {sosHistoryLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-6 h-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    </div>
                  ) : sosHistory.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-clock-rotate-left text-slate-400 text-lg" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No completed SOS yet</p>
                    </div>
                  ) : (
                    sosHistory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedHistorySOS(item)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          selectedHistorySOS?.id === item.id
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500"
                            : "bg-white dark:bg-[#0b1329]/60 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                            item.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}>
                            <i className={`fas ${item.status === "completed" ? "fa-check-double" : "fa-ban"}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800 dark:text-white truncate">{item.emergencyType}</p>
                            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">{item.client?.name || "Client"}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                item.status === "completed"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}>{item.status}</span>
                              <span className="text-[9px] font-bold text-slate-400">Rs {item.payout}</span>
                            </div>
                          </div>
                        </div>
                        {item.messages?.length > 0 && (
                          <p className="mt-2 text-[9px] text-slate-500 dark:text-slate-600 truncate border-t border-slate-100 dark:border-slate-800 pt-1.5">
                            <i className="fas fa-comment-dots mr-1 text-slate-400" />
                            {item.messages.length} message{item.messages.length !== 1 ? "s" : ""} in transcript
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <RequestList
                  requests={requests.filter((r) => r.requestType === (sidebarTab === "sos" ? "sos" : "consultation"))}
                  activeId={activeClient?.id || null}
                  onSelect={(c) => {
                    if (c.requestType === "sos") {
                      const dist = c.lat && c.lng
                        ? calculateDistance(currentCoords.lat, currentCoords.lng, c.lat, c.lng).toFixed(1)
                        : "N/A";
                      setIncomingSOS({
                        sosId: c.sosId || c.id,
                        emergencyType: c.issue,
                        clientLocation: { lat: c.lat, lng: c.lng },
                        distance: dist,
                        payout: c.payout || 3600,
                      });
                      return;
                    }
                    setActiveClient(c);
                    setIsConsultationChatOpen(true);
                  }}
                  loading={roomsLoading}
                />
              )}
            </div>

            {/* Right panel */}
            {sidebarTab === "history" && selectedHistorySOS ? (
              <div className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-[#050b1d] overflow-hidden">
                {/* History detail header */}
                <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <i className="fas fa-check-double text-sm" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">{selectedHistorySOS.emergencyType}</h4>
                      <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{selectedHistorySOS.client?.name} · {selectedHistorySOS.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHistorySOS(null)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                  >
                    <i className="fas fa-xmark" />
                  </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 flex-shrink-0">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Client</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">{selectedHistorySOS.client?.name || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Payout</div>
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">Rs {selectedHistorySOS.payout}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedHistorySOS.updatedAt ? new Date(selectedHistorySOS.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                    </div>
                  </div>
                </div>

                {/* Chat transcript */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-premium">
                  <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-3 flex items-center gap-2">
                    <i className="fas fa-scroll" /> Incident Chat Transcript
                  </div>

                  {!selectedHistorySOS.messages || selectedHistorySOS.messages.length === 0 ? (
                    <div className="text-center py-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <i className="fas fa-comment-slash text-2xl mb-2 block" />
                      No messages in this incident
                    </div>
                  ) : (
                    selectedHistorySOS.messages.map((msg: any, idx: number) => {
                      const isExpert = msg.senderType === "expert";
                      const isSystem = msg.senderType === "system";
                      if (isSystem) {
                        return (
                          <div key={msg.id || idx} className="flex justify-center">
                            <span className="bg-slate-200 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={msg.id || idx} className={`flex flex-col max-w-[75%] ${isExpert ? "ml-auto items-end" : "mr-auto items-start"}`}>
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isExpert
                              ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                              : "bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[7px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                            {msg.senderName} · {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className={`flex-1 h-full bg-slate-50 dark:bg-[#050b1d] ${isConsultationChatOpen ? "flex" : "hidden md:flex"}`}>
                <ChatArea
                  activeClient={activeClient}
                  onCloseChat={() => {
                    setActiveClient(null);
                    setIsConsultationChatOpen(false);
                  }}
                  triggerToast={triggerToast}
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- Calling screens --- */}
      {activeCall.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-lg p-6">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-850 rounded-3xl p-8 text-center space-y-8 relative overflow-hidden">
            {activeCall.type === "video" && activeCall.state === "connected" ? (
              <div className="absolute inset-0 bg-slate-800 z-0">
                <div className="w-full h-full bg-gradient-to-b from-slate-900/20 via-slate-800/80 to-slate-950 flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                    C
                  </div>
                </div>
              </div>
            ) : null}

            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 bg-slate-850 border border-slate-750 rounded-full flex items-center justify-center mx-auto shadow-xl text-2xl text-slate-300">
                {activeCall.type === "audio" ? (
                  <i className="fas fa-phone animate-pulse"></i>
                ) : (
                  <i className="fas fa-video animate-pulse"></i>
                )}
              </div>

              <div>
                <h4 className="font-bold text-lg text-white font-serif">{activeSOS?.client?.name || "Client"}</h4>
                <p className="text-xs text-amber-500 uppercase tracking-widest mt-1">
                  {activeCall.type === "audio" ? "Voice Call" : "Video Call"}
                </p>
                <div className="mt-4">
                  {activeCall.state === "dialing" && (
                    <span className="text-xs text-slate-400 animate-pulse uppercase tracking-wider font-bold">Dialing Client...</span>
                  )}
                  {activeCall.state === "connected" && (
                    <span className="text-sm font-mono text-green-400 font-bold bg-green-950/30 px-3 py-1 rounded-full border border-green-500/10">
                      {formatCallTime(callTimer)}
                    </span>
                  )}
                  {activeCall.state === "ended" && (
                    <span className="text-xs text-red-500 uppercase tracking-wider font-bold">Call Ended</span>
                  )}
                </div>
              </div>
            </div>

            {/* Call controls */}
            <div className="relative z-10 flex justify-center gap-6 pt-4">
              <button className="w-12 h-12 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-full flex items-center justify-center hover:text-white transition-colors">
                <i className="fas fa-microphone-slash"></i>
              </button>
              <button
                onClick={endCall}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all"
              >
                <i className="fas fa-phone-slash text-lg"></i>
              </button>
              <button className="w-12 h-12 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-full flex items-center justify-center hover:text-white transition-colors">
                <i className="fas fa-volume-high"></i>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
