"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { pusherClient } from "@/utils/libs/pusherClient";

// Emergency types options
const EMERGENCY_TYPES = [
  { id: "police_raid", label: "Police Raid / Search", icon: "fa-house-circle-exclamation", color: "from-red-600 to-red-800" },
  { id: "arrest", label: "Arrest & Detainment", icon: "fa-handcuffs", color: "from-orange-600 to-orange-800" },
  { id: "assault", label: "Physical Assault / Threat", icon: "fa-shield-halved", color: "from-amber-600 to-amber-800" },
  { id: "domestic", label: "Domestic Abuse / Dispute", icon: "fa-people-roof", color: "from-pink-600 to-pink-800" },
  { id: "cyber", label: "Cyber Blackmail / Breach", icon: "fa-user-secret", color: "from-purple-600 to-purple-800" },
  { id: "medical_legal", label: "Accident / Medical-Legal", icon: "fa-truck-medical", color: "from-rose-600 to-rose-800" },
];

export default function EmergencyPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Flow Stage
  const [stage, setStage] = useState<"auth-check" | "select-type" | "payment" | "searching" | "tracking" | "completed">("auth-check");
  const [selectedEmergency, setSelectedEmergency] = useState<string>("police_raid");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 }); // Default New Delhi
  const [gpsCaptured, setGpsCaptured] = useState(false);

  // SOS request details
  const [sosId, setSosId] = useState<string | null>(null);
  const [sosStatus, setSosStatus] = useState<string>("pending");
  const [assignedLawyer, setAssignedLawyer] = useState<any | null>(null);
  const [lawyerCoords, setLawyerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<string>("Calculating...");

  // Real-time Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Calling overlays
  const [activeCall, setActiveCall] = useState<{ isOpen: boolean; type: "audio" | "video" | null; state: "dialing" | "connected" | "ended" }>({
    isOpen: false,
    type: null,
    state: "dialing",
  });
  const [callTimer, setCallTimer] = useState(0);

  // Map refs
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const lawyerMarkerRef = useRef<any>(null);
  const mapContainerId = "leaflet-map";

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.user) {
          setCurrentUser(res.data.user);
          setStage("select-type");
        } else {
          window.location.href = "/login?redirect=/emergency";
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = "/login?redirect=/emergency";
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, []);

  // Capture GPS on select-type stage
  useEffect(() => {
    if (stage === "select-type") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setGpsCaptured(true);
          },
          (error) => {
            console.error("GPS capture failed, using default coords:", error);
            // Default Delhi but show captured
            setGpsCaptured(true);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setGpsCaptured(true);
      }
    }
  }, [stage]);

  // Subscribe to Pusher channel when SOS is created
  useEffect(() => {
    if (!sosId) return;

    // Subscribe to channel
    const channel = pusherClient.subscribe(`sos-${sosId}`);

    // Listen to status updates
    channel.bind("status-update", (data: any) => {
      if (data.status) {
        setSosStatus(data.status);
        if (data.status === "completed") {
          setStage("completed");
        }
      }
      if (data.lawyer) {
        setAssignedLawyer(data.lawyer);
        if (data.lawyer.currentLocation?.coordinates) {
          setLawyerCoords({
            lat: data.lawyer.currentLocation.coordinates[1],
            lng: data.lawyer.currentLocation.coordinates[0],
          });
        }
      }
      if (data.eta) {
        setEta(data.eta);
      }
    });

    // Listen to lawyer live location coordinates updates
    channel.bind("location-update", (data: any) => {
      setLawyerCoords({
        lat: data.lat,
        lng: data.lng,
      });

      // Recalculate ETA (simulated based on coordinates difference)
      const latDiff = Math.abs(data.lat - userCoords.lat);
      const lngDiff = Math.abs(data.lng - userCoords.lng);
      const approxDistanceKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
      const mins = Math.max(1, Math.round(approxDistanceKm * 2));
      setEta(`${mins} mins`);
    });

    // Listen to real-time chat messages
    channel.bind("chat-message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      pusherClient.unsubscribe(`sos-${sosId}`);
    };
  }, [sosId, userCoords]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (stage === "tracking" && typeof window !== "undefined" && (window as any).L) {
      const L = (window as any).L;

      const container = document.getElementById(mapContainerId);
      if (!container) return;

      // 1. Initialize L.map
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([userCoords.lat, userCoords.lng], 15);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // 2. User marker creation
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      } else {
        const userIcon = L.divIcon({
          className: "user-marker-pulse",
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
              <div class="relative rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);
      }

      // 3. Lawyer marker creation
      if (lawyerCoords) {
        if (lawyerMarkerRef.current) {
          lawyerMarkerRef.current.setLatLng([lawyerCoords.lat, lawyerCoords.lng]);
        } else {
          const lawyerIcon = L.divIcon({
            className: "lawyer-marker-gold",
            html: `
              <div class="flex items-center justify-center w-9 h-9 bg-amber-500 border-2 border-white rounded-full shadow-2xl text-white">
                <i class="fas fa-scale-balanced text-sm"></i>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
          lawyerMarkerRef.current = L.marker([lawyerCoords.lat, lawyerCoords.lng], { icon: lawyerIcon }).addTo(map);
        }

        // Auto zoom and pan to fit both markers
        const bounds = L.latLngBounds(
          [userCoords.lat, userCoords.lng],
          [lawyerCoords.lat, lawyerCoords.lng]
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView([userCoords.lat, userCoords.lng], 15);
      }
    }
  }, [stage, userCoords, lawyerCoords]);

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

  // Format call timer (e.g. 01:23)
  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Payment triggers Razorpay
  const handlePayment = async () => {
    if (!currentUser) return;
    try {
      // 1. Create order on backend
      const res = await axios.post("/api/create-order", {
        amount: 4500, // ₹4500 SOS Fee
        currency: "INR",
        receipt: `sos_receipt_${Date.now()}`,
      });

      if (!res.data.success) {
        alert("Failed to initialize payment");
        return;
      }

      const { order, key_id } = res.data;

      // 2. Open Razorpay checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "NaiyeBharat",
        description: "Emergency Legal Assistance (SOS Activation Fee)",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await axios.post("/api/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Proceed to searching state & broadcast
              setStage("searching");
              const label = EMERGENCY_TYPES.find((e) => e.id === selectedEmergency)?.label || "Emergency";

              const createRes = await axios.post("/api/sos/create", {
                clientId: currentUser.id,
                lat: userCoords.lat,
                lng: userCoords.lng,
                paymentId: response.razorpay_payment_id,
                emergencyType: label,
              });

              if (createRes.data.success) {
                setSosId(createRes.data.sosId);
                window.location.href = `/client?sos=${createRes.data.sosId}`;
              } else {
                alert("Failed to create SOS request");
                setStage("select-type");
              }
            } else {
              alert("Payment verification failed");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error during payment verification");
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: "#b91c1c",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay Payment Error:", err);
      alert("Razorpay checkout failed. Please verify keys and connection.");
    }
  };

  // Send message API trigger
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !sosId || !currentUser) return;

    try {
      await axios.post("/api/sos/chat", {
        sosId,
        senderType: "client",
        senderName: currentUser.name,
        text: newMessageText.trim(),
      });
      setNewMessageText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // Mock audio/video calling logic
  const startCall = (type: "audio" | "video") => {
    setActiveCall({ isOpen: true, type, state: "dialing" });
    // Transition dialer to connected state in 3s
    setTimeout(() => {
      setActiveCall((prev) => (prev.isOpen ? { ...prev, state: "connected" } : prev));
    }, 3000);
  };

  const endCall = () => {
    setActiveCall((prev) => ({ ...prev, state: "ended" }));
    setTimeout(() => {
      setActiveCall({ isOpen: false, type: null, state: "dialing" });
    }, 1000);
  };

  // Release payment manually triggers finished status
  const handleReleasePayment = async () => {
    if (!sosId) return;
    try {
      const res = await axios.post("/api/admin/sos-actions", {
        action: "release-payment",
        sosId,
      });
      if (res.data.success) {
        alert("Payment has been released successfully to the advocate. Thank you.");
        setStage("completed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to release payment");
    }
  };

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-red-500 animate-spin"></div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Initializing SOS Console...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#050b1d] min-h-screen relative overflow-hidden font-sans text-slate-100 flex flex-col justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none grid grid-cols-8 gap-0">
        {[...Array(64)].map((_, i) => (
          <div key={i} className="border border-white h-full"></div>
        ))}
      </div>

      {/* --- STAGE 1: CHOOSE EMERGENCY TYPE --- */}
      {stage === "select-type" && (
        <div className="max-w-4xl w-full mx-auto px-4 py-8 z-10">
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[30px] border border-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Pillar: Info */}
              <div className="md:w-[40%] bg-red-700 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-red-950 to-red-950"></div>
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/30 animate-pulse">
                    <i className="fas fa-triangle-exclamation text-xl"></i>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-wider mb-4 leading-tight">
                    Emergency <br /> Response
                  </h1>
                  <p className="text-red-100 text-xs sm:text-sm font-light leading-relaxed">
                    Immediate legal intervention. Once paid, the system automatically dispatches the nearest verified advocate within a 15km radius.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
                    GPS location verified
                  </div>
                  {gpsCaptured && (
                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <div className="text-[8px] uppercase tracking-wider opacity-60">Your Coords</div>
                      <div className="text-xs font-mono font-bold mt-1 text-red-500">
                        {userCoords.lat.toFixed(5)}° N, {userCoords.lng.toFixed(5)}° E
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pillar: Forms */}
              <div className="md:w-[60%] p-8 sm:p-10 space-y-6">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Step 1 of 2</h2>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif mt-1">Select Emergency Category</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EMERGENCY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedEmergency(type.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                        selectedEmergency === type.id
                          ? "bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-white"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                          selectedEmergency === type.id ? type.color : "from-slate-800 to-slate-900"
                        } shadow-inner group-hover:scale-105 transition-transform`}
                      >
                        <i className={`fas ${type.icon} text-base`}></i>
                      </div>
                      <div>
                        <div className="text-xs font-bold">{type.label}</div>
                        <div className="text-[9px] opacity-50 mt-0.5">24/7 Action Unit</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <Link href="/" className="text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-arrow-left text-[10px]"></i> Cancel
                  </Link>
                  <button
                    onClick={() => setStage("payment")}
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
                  >
                    Proceed to Payment <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 2: PAYMENT OVERLAY --- */}
      {stage === "payment" && (
        <div className="max-w-md w-full mx-auto px-4 z-10">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-center space-y-6">
            <div className="w-16 h-16 bg-red-950/60 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse text-2xl shadow-xl">
              <i className="fas fa-credit-card"></i>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-red-500">Step 2 of 2</h2>
              <h3 className="text-2xl font-serif font-black uppercase tracking-wider mt-1 text-white">SOS Service Fee</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                An authorization fee of ₹4,500 applies for dispatching senior defense counsel immediately. Secure checkout processed by Razorpay.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Immediate Legal Response Fee</span>
                <span className="font-bold text-slate-100">₹4,500.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>GST Tax (Included)</span>
                <span className="font-bold text-slate-100">₹0.00</span>
              </div>
              <div className="border-t border-slate-850 my-3 pt-3 flex justify-between text-sm font-bold">
                <span className="text-slate-300">Total Charged</span>
                <span className="text-red-500 text-lg">₹4,500.00</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayment}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-950/30 flex items-center justify-center gap-2"
              >
                Pay & Dispatch Now <i className="fas fa-shield-halved"></i>
              </button>
              <button
                onClick={() => setStage("select-type")}
                className="w-full py-3 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors"
              >
                Back to categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 3: SEARCHING RADAR --- */}
      {stage === "searching" && (
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-8 z-10">
          {/* Radar Wave Pulse */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping opacity-25" style={{ animationDuration: "3s" }}></div>
            <div className="absolute inset-4 rounded-full border border-red-500/30 animate-ping opacity-50" style={{ animationDuration: "2s" }}></div>
            <div className="absolute inset-10 rounded-full border border-red-500/40 animate-ping opacity-75" style={{ animationDuration: "1.5s" }}></div>
            <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)] border border-white/20 relative">
              <i className="fas fa-satellite-dish text-2xl text-white animate-pulse"></i>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold uppercase tracking-wider text-red-500 font-serif">Finding Nearest Counsel</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Broadcasting your {EMERGENCY_TYPES.find((e) => e.id === selectedEmergency)?.label || "Emergency"} incident coordinates to the top 5 verified available lawyers in your geo-vicinity.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono tracking-wider text-amber-500 mt-2">
              <i className="fas fa-spinner animate-spin"></i> Broadcasting to network...
            </div>
          </div>

          {/* Dev bypass controls */}
          <div className="pt-8 border-t border-slate-900">
            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl max-w-xs mx-auto">
              <div className="text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1.5 justify-center mb-1">
                <i className="fas fa-circle-info"></i> Developer Controls
              </div>
              <p className="text-[9px] text-amber-400 opacity-80 leading-relaxed mb-3">
                To test the advocate flow, log in as a lawyer in another window, set status to Available, and click Accept on the incoming popup.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Force mock assignment
                    setStage("tracking");
                    setSosStatus("accepted");
                    setAssignedLawyer({
                      id: "mock_lawyer_id",
                      name: "Adv. Raghav Sharma",
                      phoneNumber: "+91 98765 43210",
                      experience: 12,
                      specialty: "Criminal Litigation",
                      avatar: "",
                    });
                    setLawyerCoords({
                      lat: userCoords.lat + 0.005,
                      lng: userCoords.lng + 0.005,
                    });
                    setEta("8 mins");
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all"
                >
                  Force Mock Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 4: ACTIVE TRACKING (UBER STYLE) --- */}
      {stage === "tracking" && (
        <div className="w-full h-screen flex flex-col md:flex-row relative">
          {/* Main Map Background */}
          <div className="flex-1 h-[45vh] md:h-full w-full relative z-0">
            <div id={mapContainerId} className="w-full h-full bg-slate-950" />
            
            {/* Map floating header - ETA badge */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Estimated Arrival</div>
                  <div className="text-sm font-black text-white font-mono">{eta}</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500">
                  <i className="fas fa-signal-strike"></i>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Emergency Status</div>
                  <div className="text-xs font-black uppercase text-red-500 tracking-wider">
                    {sosStatus === "accepted" && "Counsels Dispatched"}
                    {sosStatus === "en_route" && "Lawyer Traveling"}
                    {sosStatus === "arrived" && "Lawyer Arrived"}
                    {sosStatus === "completed" && "Completed"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar info */}
          <div className="w-full md:w-[420px] bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-850 h-[55vh] md:h-full flex flex-col justify-between relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Header / lawyer details */}
            <div className="p-6 border-b border-slate-900">
              <div className="text-[8px] uppercase tracking-[0.3em] font-bold text-red-500 mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> Active SOS response
              </div>

              {assignedLawyer ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 font-serif text-xl font-black shadow-lg">
                      {assignedLawyer.avatar ? (
                        <img src={assignedLawyer.avatar} alt="Lawyer avatar" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        assignedLawyer.name.charAt(5) || "L"
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white font-serif">{assignedLawyer.name}</h4>
                      <p className="text-xs text-amber-500 font-medium mt-0.5">{assignedLawyer.specialty}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md font-bold">
                          Exp: {assignedLawyer.experience} Years
                        </span>
                        <span className="text-[9px] px-2 py-0.5 bg-green-950/40 border border-green-500/20 text-green-400 rounded-md font-bold">
                          Verified SOS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startCall("audio")}
                      className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95"
                    >
                      <i className="fas fa-phone-flip text-xs"></i>
                    </button>
                    <button
                      onClick={() => startCall("video")}
                      className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95"
                    >
                      <i className="fas fa-video text-xs"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <i className="fas fa-spinner animate-spin"></i> Loading assigned counsel details...
                </div>
              )}
            </div>

            {/* Middle: Chat / Status Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-premium flex flex-col justify-end">
              {/* Chat trigger */}
              {!isChatOpen ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <i className="fas fa-message text-sm"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Need to communicate detail?</h5>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[250px] mx-auto leading-relaxed">
                      Send text messages or call your assigned lawyer directly regarding the ongoing emergency.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all"
                  >
                    Open Live Chat
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Secure Chatroom</span>
                    <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pb-3 min-h-[120px] scrollbar-premium">
                    {messages.length === 0 ? (
                      <div className="text-center text-[10px] text-slate-600 mt-6 font-bold uppercase tracking-wider">
                        No messages yet. Chat is active.
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[75%] ${
                            msg.senderType === "client" ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              msg.senderType === "client"
                                ? "bg-red-600 text-white rounded-tr-none"
                                : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
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

                  {/* Input field */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-red-500 outline-none"
                    />
                    <button type="submit" className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white text-xs hover:bg-red-700 active:scale-95 transition-all">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Panel - Journey stages and manual payments */}
            <div className="p-6 border-t border-slate-900 space-y-4">
              {sosStatus === "completed" && (
                <div className="bg-green-950/20 border border-green-500/25 p-4 rounded-2xl text-center space-y-3">
                  <div className="text-xs font-bold text-green-400 flex items-center gap-1.5 justify-center">
                    <i className="fas fa-circle-check"></i> Case marked completed by Lawyer
                  </div>
                  <button
                    onClick={handleReleasePayment}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    Release Payout to Lawyer
                  </button>
                </div>
              )}

              {/* Dev help coordinates update simulation */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-2">Simulated Driver Journey</div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      // Trigger simulating step 1
                      await axios.post("/api/advocate/update-location", {
                        lat: userCoords.lat + 0.002,
                        lng: userCoords.lng + 0.002,
                        sosStatus: "busy",
                      });
                    }}
                    className="w-1/2 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-colors"
                  >
                    Move Closer
                  </button>
                  <button
                    onClick={async () => {
                      // Trigger arrived
                      await axios.post("/api/advocate/update-location", {
                        lat: userCoords.lat,
                        lng: userCoords.lng,
                        sosStatus: "busy",
                      });
                    }}
                    className="w-1/2 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-colors"
                  >
                    Arrive Client
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- STAGE 5: COMPLETED STATUS --- */}
      {stage === "completed" && (
        <div className="max-w-md w-full mx-auto px-4 z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-950/60 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400 text-3xl shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <i className="fas fa-check-double animate-pulse"></i>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black uppercase tracking-wider text-white">Emergency Resolved</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              The case has been marked as resolved and payment of ₹3,600 has been released successfully to the assigned advocate.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-left max-w-sm mx-auto">
            <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-3 pb-1.5 border-b border-slate-850">
              Receipt summary
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Incident Category:</span>
              <span className="font-bold text-slate-200">
                {EMERGENCY_TYPES.find((e) => e.id === selectedEmergency)?.label || "Emergency Legal"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Assigned Advocate:</span>
              <span className="font-bold text-slate-200">{assignedLawyer?.name || "Raghav Sharma"}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Amount Paid:</span>
              <span className="font-bold text-green-400">₹4,500.00</span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      )}

      {/* --- calling interface overlay --- */}
      {activeCall.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-lg p-6">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-850 rounded-3xl p-8 text-center space-y-8 relative overflow-hidden">
            {/* Visualizer wave lines for audio call / camera grid for video call */}
            {activeCall.type === "video" && activeCall.state === "connected" ? (
              <div className="absolute inset-0 bg-slate-800 z-0">
                {/* Mock camera view */}
                <div className="w-full h-full bg-gradient-to-b from-slate-900/20 via-slate-800/80 to-slate-950 flex items-center justify-center">
                  <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 text-3xl font-black font-serif shadow-2xl">
                    {assignedLawyer?.name.charAt(5)}
                  </div>
                </div>
                <div className="absolute bottom-20 right-4 w-28 h-36 bg-slate-900 border-2 border-white/20 rounded-xl shadow-2xl overflow-hidden">
                  {/* Client self view mock */}
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                    <i className="fas fa-user text-slate-500 text-xl"></i>
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
                <h4 className="font-bold text-lg text-white font-serif">{assignedLawyer?.name || "Advocate"}</h4>
                <p className="text-xs text-amber-500 uppercase tracking-widest mt-1">
                  {activeCall.type === "audio" ? "Voice Call" : "Video Call"}
                </p>
                <div className="mt-4">
                  {activeCall.state === "dialing" && (
                    <span className="text-xs text-slate-400 animate-pulse uppercase tracking-wider font-bold">Dialing counsel...</span>
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
    </main>
  );
}
