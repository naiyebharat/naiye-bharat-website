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

  // Map refs
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const lawyerMarkerRef = useRef<any>(null);
  const mapContainerId = "advocate-leaflet-map";
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

  const fetchRequestPipeline = useCallback(async () => {
    setRoomsLoading(true);
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
      setRoomsLoading(false);
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
          fetchRequestPipeline();
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    }
    fetchProfile();
  }, [fetchRequestPipeline, setUser]);

  useEffect(() => {
    if (!advocateProfile) return;

    const interval = setInterval(fetchRequestPipeline, 5000);
    return () => clearInterval(interval);
  }, [advocateProfile, fetchRequestPipeline]);

  // Check active SOS from DB
  const checkActiveSOS = async () => {
    try {
      const res = await axios.get("/api/advocate/active-sos");
      if (res.data.success && res.data.activeSOS) {
        setActiveSOS(res.data.activeSOS);
        setSosStatus("busy");
        // Load messages for this active SOS
        // In this implementation, chat messages are real-time, starting empty
      }
    } catch (err) {
      console.error(err);
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
          setActiveSOS(null);
          setSosStatus("available");
        }
      }
    });

    sosChannel.bind("chat-message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      pusherClient.unsubscribe(`sos-${activeSOS._id}`);
    };
  }, [activeSOS]);

  // Initialize and update Leaflet Map in Active SOS Screen
  useEffect(() => {
    if (activeSOS && typeof window !== "undefined" && (window as any).L) {
      const L = (window as any).L;

      const container = document.getElementById(mapContainerId);
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([currentCoords.lat, currentCoords.lng], 15);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      const clientLat = activeSOS.clientLocation.coordinates[1];
      const clientLng = activeSOS.clientLocation.coordinates[0];

      // Update Lawyer marker
      if (lawyerMarkerRef.current) {
        lawyerMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
      } else {
        const lawyerIcon = L.divIcon({
          className: "lawyer-marker-gold-large",
          html: `
            <div class="flex items-center justify-center w-9 h-9 bg-amber-500 border-2 border-white rounded-full shadow-2xl text-white">
              <i class="fas fa-scale-balanced text-sm"></i>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        lawyerMarkerRef.current = L.marker([currentCoords.lat, currentCoords.lng], { icon: lawyerIcon }).addTo(map);
      }

      // Update Client marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([clientLat, clientLng]);
      } else {
        const userIcon = L.divIcon({
          className: "client-marker-pulse-large",
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-75"></span>
              <div class="relative rounded-full h-4.5 w-4.5 bg-red-600 border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarkerRef.current = L.marker([clientLat, clientLng], { icon: userIcon }).addTo(map);
      }

      // Fit bounds to show both client and lawyer
      const bounds = L.latLngBounds(
        [currentCoords.lat, currentCoords.lng],
        [clientLat, clientLng]
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [activeSOS, currentCoords]);

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
            <div className={`w-full md:w-85 lg:w-96 h-full flex-shrink-0 bg-white dark:bg-[#070d1e] border-r border-slate-200 dark:border-slate-900 ${isConsultationChatOpen ? "hidden md:flex" : "flex"} flex-col`}>
              <div className="p-3 border-b border-slate-200 dark:border-slate-800/65 flex gap-2 bg-slate-50 dark:bg-[#050b1d]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("consultation");
                    setActiveClient(null);
                  }}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${
                    activeTab === "consultation"
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                      : "bg-white dark:bg-[#0b1329] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Consultations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("sos");
                    setActiveClient(null);
                  }}
                  className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center justify-center gap-1.5 ${
                    activeTab === "sos"
                      ? "bg-red-650 text-white border-red-650 shadow-md"
                      : "bg-white dark:bg-[#0b1329] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:text-red-500 dark:hover:text-red-400"
                  }`}
                >
                  SOS Alerts
                  {requests.some((r) => r.requestType === "sos") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              </div>
              <RequestList
                requests={requests.filter((r) => r.requestType === activeTab)}
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
            </div>

            {/* Right sidebar - Consultation Chat details */}
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
