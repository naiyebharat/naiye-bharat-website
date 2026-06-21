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
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [toast, setToast] = useState<ToastData>({ show: false, title: "", message: "", type: "info" });
  const [advocateProfile, setAdvocateProfile] = useState<any | null>(null);

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

  // Map refs
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const lawyerMarkerRef = useRef<any>(null);
  const mapContainerId = "advocate-leaflet-map";

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

  // Fetch dynamic profile details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.user) {
          setAdvocateProfile(res.data.user);
          // Check if lawyer has an active SOS from DB
          checkActiveSOS();
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    }
    fetchProfile();
  }, []);

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
    const savedTheme = localStorage.getItem("nb_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const handleToggleTheme = () => {
    if (!theme) return;
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("nb_theme", nextTheme);
    if (nextTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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

  // Subscribe to global lawyers and specific active SOS pusher channels
  useEffect(() => {
    if (!advocateProfile) return;

    // 1. Subscribe to "lawyers" general channel for new SOS broadcasts
    const lawyersChannel = pusherClient.subscribe("lawyers");

    lawyersChannel.bind("new-sos", (data: any) => {
      // Only show popup alert if lawyer is available & targeted
      if (sosStatus === "available") {
        if (data.targetLawyers && data.targetLawyers.includes(advocateProfile.id)) {
          // Calculate distance to client
          const dist = calculateDistance(currentCoords.lat, currentCoords.lng, data.lat, data.lng);
          
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
  }, [advocateProfile, sosStatus, currentCoords]);

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

  // Toggle status API update
  const handleStatusChange = async (newStatus: "offline" | "available" | "busy") => {
    setSosStatus(newStatus);
    try {
      await axios.post("/api/advocate/update-location", {
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        sosStatus: newStatus,
      });
      triggerToast("Status Updated", `Your SOS availability status is now ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Update Failed", "Could not synchronize status with server", "error");
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

      {/* --- ACTIVE EMERGENCY OVERLAY DASHBOARD --- */}
      {activeSOS ? (
        <div className="w-full h-screen flex flex-col md:flex-row relative z-40 bg-slate-950 text-slate-100">
          
          {/* Main Leaflet Map Area */}
          <div className="flex-1 h-[40vh] md:h-full w-full relative z-0">
            <div id={mapContainerId} className="w-full h-full" />
            
            {/* Map Header Status info */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                  <i className="fas fa-triangle-exclamation"></i>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Emergency Incident</div>
                  <div className="text-xs font-black text-white">{activeSOS.emergencyType}</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <i className="fas fa-route"></i>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Client Distance</div>
                  <div className="text-xs font-bold font-mono text-amber-400">
                    {calculateDistance(
                      currentCoords.lat,
                      currentCoords.lng,
                      activeSOS.clientLocation.coordinates[1],
                      activeSOS.clientLocation.coordinates[0]
                    ).toFixed(2)} km
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Control & Chat Panel */}
          <div className="w-full md:w-[420px] bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-900 h-[60vh] md:h-full flex flex-col justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Client detail Header */}
            <div className="p-6 border-b border-slate-900 flex justify-between items-center">
              <div>
                <div className="text-[8px] uppercase tracking-[0.2em] font-bold text-red-500 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> Active Engagement
                </div>
                <h4 className="font-bold text-base text-white font-serif">{activeSOS.client?.name || "Client Support"}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{activeSOS.client?.phoneNumber || "No Contact"}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startCall("audio")}
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <i className="fas fa-phone"></i>
                </button>
                <button
                  onClick={() => startCall("video")}
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <i className="fas fa-video"></i>
                </button>
              </div>
            </div>

            {/* Chat message space */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-premium flex flex-col justify-end">
              {isChatOpen ? (
                <div className="h-full flex flex-col justify-between">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-900 pb-1.5 mb-2 flex justify-between items-center">
                    <span>Incident Chat Room</span>
                    <span className="text-[8px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pb-3 min-h-[140px] scrollbar-premium">
                    {messages.length === 0 ? (
                      <div className="text-center text-[10px] text-slate-600 mt-6 font-bold uppercase tracking-wider">
                        Incident communication initialized. Send a text.
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[75%] ${
                            msg.senderType === "expert" ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              msg.senderType === "expert"
                                ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                                : "bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[7px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                            {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                    <button type="submit" className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 text-xs hover:bg-amber-600 active:scale-95 transition-all">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              ) : null}
            </div>

            {/* Bottom Actions and Status controller */}
            <div className="p-6 border-t border-slate-900 space-y-4">
              <div>
                <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-2">Travel & Engagement controls</div>
                
                {activeSOS.status === "accepted" && (
                  <button
                    onClick={() => handleUpdateSOSStatus("en_route")}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Start Travel <i className="fas fa-car"></i>
                  </button>
                )}

                {activeSOS.status === "en_route" && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleUpdateSOSStatus("arrived")}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Mark Arrived at Location <i className="fas fa-street-view"></i>
                    </button>

                    {/* Simulating travel controls */}
                    <button
                      onClick={toggleSimulateTravel}
                      className={`w-full py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-2 ${
                        isSimulatingTravel
                          ? "bg-amber-950/20 border-amber-500/20 text-amber-500"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <i className={`fas ${isSimulatingTravel ? "fa-circle-notch animate-spin" : "fa-person-running"}`}></i>
                      {isSimulatingTravel ? "Simulating vehicle movement..." : "Start Simulated Travel"}
                    </button>
                  </div>
                )}

                {activeSOS.status === "arrived" && (
                  <button
                    onClick={() => handleUpdateSOSStatus("completed")}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Complete Incident Support <i className="fas fa-check-double"></i>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : null}

      {/* --- INCOMING SOS POPUP TRIGGER MODAL --- */}
      {incomingSOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_80px_rgba(239,68,68,0.3)] animate-sos-pulse relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-shimmer"></div>
            
            <div className="w-16 h-16 bg-red-950/60 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse text-2xl shadow-xl">
              <i className="fas fa-triangle-exclamation"></i>
            </div>

            <div>
              <span className="px-3 py-1 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full text-[9px] font-bold tracking-widest uppercase">
                EMERGENCY ALERT BROADCAST
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mt-3">{incomingSOS.emergencyType}</h3>
              <p className="text-slate-400 text-xs mt-1">A client requires immediate dispatch and field defense counsel.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <div className="text-left">
                <div className="text-[8px] uppercase tracking-wider text-slate-500">Client Distance</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{incomingSOS.distance} km</div>
              </div>
              <div className="text-left border-l border-slate-850 pl-4">
                <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold text-green-500">Est. Payout (80%)</div>
                <div className="text-lg font-black text-green-400 font-mono mt-0.5">₹{incomingSOS.payout}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIncomingSOS(null)}
                className="w-1/3 py-3 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptSOS}
                className="w-2/3 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                Accept & Dispatch <i className="fas fa-bolt"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STANDARD CONSULTATION VIEW WORKSPACE --- */}
      {!activeSOS && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header Panel */}
          <div className="bg-white dark:bg-[#0b1329] border-b border-slate-200 dark:border-slate-850 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center text-gold-500 text-lg">
                <i className="fas fa-scale-balanced"></i>
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900 dark:text-white font-serif">Advocate Control Console</h1>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">NaiyeBharat Defence Network</p>
              </div>
            </div>

            {/* SOS Mode Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
              <button
                onClick={() => handleStatusChange("offline")}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  sosStatus === "offline"
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-950 dark:text-white font-black"
                    : "text-slate-400 dark:text-slate-600 hover:text-slate-200"
                }`}
              >
                Offline
              </button>
              <button
                onClick={() => handleStatusChange("available")}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                  sosStatus === "available"
                    ? "bg-green-600 text-white font-black"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Available
              </button>
              <button
                onClick={() => handleStatusChange("busy")}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  sosStatus === "busy"
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-200"
                }`}
              >
                Busy
              </button>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} onToggleTheme={handleToggleTheme} />
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>

          {/* Regular Client list & chat split */}
          <div className="flex-1 flex overflow-hidden w-full relative">
            {/* Left sidebar - Room lists */}
            <div className={`w-full md:w-85 lg:w-96 h-full flex-shrink-0 bg-white dark:bg-[#070d1e] border-r border-slate-200 dark:border-slate-900 ${isConsultationChatOpen ? "hidden md:flex" : "flex"}`}>
              <RequestList
                requests={requests}
                activeId={activeClient?.id || null}
                onSelect={(c) => {
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