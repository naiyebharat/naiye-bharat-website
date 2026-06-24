"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { pusherClient } from "@/utils/libs/pusherClient";
import ThemeToggle from "../../advocate/components/ThemeToggle";
import TelemetryFeedList from "../components/TelemetryFeedList";
import LawyerVerificationRegister from "../components/LawyerVerificationRegister";
import DetailSosOrderView from "../components/DetailSosOrderView";

export default function AdminSOSPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [adminProfile, setAdminProfile] = useState<any | null>(null);

  // Data states
  const [sosRequests, setSosRequests] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [availableLawyers, setAvailableLawyers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSOSOrder, setSelectedSOSOrder] = useState<any | null>(null);

  // UI tabs and filters
  const [activeTab, setActiveTab] = useState<"dashboard" | "verification">("dashboard");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Reassignment & Verification Modal States
  const [reassignTarget, setReassignTarget] = useState<any | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<{ id: string; currentStatus: boolean; name: string } | null>(null);

  // Map variables
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: { client: any; lawyer?: any; line?: any } }>({});
  const mapContainerId = "admin-leaflet-map-all";

  // Init theme & auth
  useEffect(() => {
    const savedTheme = localStorage.getItem("nb_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    async function checkAuth() {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.user && res.data.user.role === "admin") {
          setAdminProfile(res.data.user);
        } else {
          window.location.href = "/login?redirect=/admin/sos";
        }
      } catch (err) {
        console.error(err);
        window.location.href = "/login?redirect=/admin/sos";
      }
    }
    checkAuth();
  }, []);

  const handleToggleTheme = () => {
    if (!theme) return;
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("nb_theme", nextTheme);
    if (nextTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoadingData(true);
      // Fetch SOS requests
      const sosRes = await axios.get("/api/admin/sos-actions");
      if (sosRes.data.success) {
        setSosRequests(sosRes.data.data);
      }

      // Fetch all lawyers for verification tab
      const lawyerRes = await axios.post("/api/admin/sos-actions", {
        action: "get-all-lawyers",
      });
      if (lawyerRes.data.success) {
        setLawyers(lawyerRes.data.lawyers);
      }
    } catch (err) {
      console.error("Fetch admin data error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (adminProfile) {
      fetchData();
    }
  }, [adminProfile]);

  // Subscribe to Pusher admin channel
  useEffect(() => {
    if (!adminProfile) return;

    const channel = pusherClient.subscribe("admin-sos");

    // Real-time updates for SOS status
    channel.bind("sos-updated", (data: any) => {
      setSosRequests((prev) =>
        prev.map((sos) => {
          if (sos._id === data.sosId) {
            return { ...sos, status: data.status, lawyerId: data.lawyerId || sos.lawyerId };
          }
          return sos;
        })
      );
      // Refresh to pull fresh enriched details
      fetchData();
    });

    // Real-time location updates for assigned lawyers
    channel.bind("lawyer-location", (data: any) => {
      const { sosId, lat, lng } = data;
      
      // Update marker position on map dynamically
      if (typeof window !== "undefined" && (window as any).L && mapRef.current) {
        const L = (window as any).L;
        const markerGroup = markersRef.current[sosId];
        if (markerGroup) {
          if (markerGroup.lawyer) {
            markerGroup.lawyer.setLatLng([lat, lng]);
          } else {
            const lawyerIcon = L.divIcon({
              className: `lawyer-pin-${sosId}`,
              html: `<div class="w-8 h-8 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg"><i class="fas fa-scale-balanced text-[10px]"></i></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            markerGroup.lawyer = L.marker([lat, lng], { icon: lawyerIcon }).addTo(mapRef.current);
          }

          // Redraw line
          if (markerGroup.line) {
            markerGroup.line.setLatLngs([
              markerGroup.client.getLatLng(),
              [lat, lng]
            ]);
          } else {
            markerGroup.line = L.polyline([
              markerGroup.client.getLatLng(),
              [lat, lng]
            ], { color: '#f59e0b', weight: 3, dashArray: '5, 8' }).addTo(mapRef.current);
          }
        }
      }
    });

    channel.bind("payment-released", (data: any) => {
      setSosRequests((prev) =>
        prev.map((sos) => {
          if (sos._id === data.sosId) {
            return { ...sos, paymentReleased: true };
          }
          return sos;
        })
      );
    });

    return () => {
      pusherClient.unsubscribe("admin-sos");
    };
  }, [adminProfile]);

  // Leaflet map initialization
  useEffect(() => {
    if (activeTab === "dashboard" && sosRequests.length > 0 && typeof window !== "undefined" && (window as any).L) {
      const L = (window as any).L;

      const container = document.getElementById(mapContainerId);
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([28.6139, 77.209], 11);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Clear old markers
      Object.keys(markersRef.current).forEach((key) => {
        const { client, lawyer, line } = markersRef.current[key];
        if (client) map.removeLayer(client);
        if (lawyer) map.removeLayer(lawyer);
        if (line) map.removeLayer(line);
      });
      markersRef.current = {};

      const points: any[] = [];

      // Add pins for active requests
      sosRequests.forEach((sos) => {
        if (sos.status !== "completed" && sos.status !== "cancelled") {
          const clientLat = sos.clientLocation.coordinates[1];
          const clientLng = sos.clientLocation.coordinates[0];
          points.push([clientLat, clientLng]);

          // Client Marker
          const clientIcon = L.divIcon({
            className: `client-pin-${sos._id}`,
            html: `
              <div class="relative flex items-center justify-center">
                <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-75"></span>
                <div class="relative rounded-full h-4.5 w-4.5 bg-red-600 border-2 border-white shadow-md"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          const clientMarker = L.marker([clientLat, clientLng], { icon: clientIcon })
            .addTo(map)
            .bindPopup(`<b>Client:</b> ${sos.client?.name || "Client"}<br/><b>Emergency:</b> ${sos.emergencyType}`);

          let lawyerMarker = undefined;
          let activeLine = undefined;

          // Lawyer Marker
          if (sos.lawyer && sos.lawyer.currentLocation?.coordinates) {
            const lawyerLat = sos.lawyer.currentLocation.coordinates[1];
            const lawyerLng = sos.lawyer.currentLocation.coordinates[0];
            points.push([lawyerLat, lawyerLng]);

            const lawyerIcon = L.divIcon({
              className: `lawyer-pin-${sos._id}`,
              html: `<div class="w-8 h-8 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg"><i class="fas fa-scale-balanced text-[10px]"></i></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            lawyerMarker = L.marker([lawyerLat, lawyerLng], { icon: lawyerIcon })
              .addTo(map)
              .bindPopup(`<b>Lawyer:</b> ${sos.lawyer.name}<br/><b>Status:</b> ${sos.status.toUpperCase()}`);

            // Connect client & lawyer with dotted line
            activeLine = L.polyline([[clientLat, clientLng], [lawyerLat, lawyerLng]], {
              color: "#f59e0b",
              weight: 3,
              dashArray: "5, 8",
            }).addTo(map);
          }

          markersRef.current[sos._id] = {
            client: clientMarker,
            lawyer: lawyerMarker,
            line: activeLine,
          };
        }
      });

      // Fit map boundary to include all points
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [activeTab, sosRequests]);

  // Load available lawyers for reassignment modal
  const openReassignModal = async (sos: any) => {
    setReassignTarget(sos);
    try {
      const res = await axios.post("/api/admin/sos-actions", {
        action: "get-available-lawyers",
      });
      if (res.data.success) {
        setAvailableLawyers(res.data.lawyers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger reassignment
  const handleReassignLawyer = async (lawyerId: string) => {
    if (!reassignTarget) return;
    try {
      const res = await axios.post("/api/admin/sos-actions", {
        action: "reassign",
        sosId: reassignTarget._id,
        lawyerId,
      });
      if (res.data.success) {
        alert("Lawyer has been reassigned successfully.");
        setReassignTarget(null);
        fetchData();
      }
    } catch (err: any) {
      alert("Failed to reassign: " + (err.response?.data?.message || err.message));
    }
  };

  // Toggle lawyer SOS verification
  const handleToggleVerification = async () => {
    if (!verifyTarget) return;
    try {
      const res = await axios.post("/api/admin/sos-actions", {
        action: "toggle-verification",
        advocateId: verifyTarget.id,
        verify: !verifyTarget.currentStatus,
      });
      if (res.data.success) {
        setVerifyTarget(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update verification status.");
    }
  };

  // Release payment to lawyer
  const handleReleasePayment = async (sosId: string) => {
    try {
      const res = await axios.post("/api/admin/sos-actions", {
        action: "release-payment",
        sosId,
      });
      if (res.data.success) {
        alert("Payment payout of ₹3,600 has been released successfully to the lawyer.");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to release payout.");
    }
  };

  // Financial summary metrics
  const activeSOSCount = sosRequests.filter((s) => s.status !== "completed" && s.status !== "cancelled").length;
  const completedSOSCount = sosRequests.filter((s) => s.status === "completed").length;
  const totalPaid = sosRequests.filter((s) => s.status === "completed").length * 4500;
  const totalCommission = completedSOSCount * 900;

  // Filtered requests for dashboard table view
  const filteredRequests = sosRequests.filter((sos) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return sos.status !== "completed" && sos.status !== "cancelled";
    return sos.status === filterStatus;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050b1d] dark:text-white p-4 sm:p-6 font-sans transition-colors duration-500 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white uppercase">
                NAIYE <span className="text-emerald-600 dark:text-[#00c2a8]">BHARAT</span>
              </span>
              <span className="hidden md:block text-[10px] font-black bg-red-50 text-red-700 border border-red-200/60 px-2.5 py-1 rounded-md dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 uppercase tracking-widest animate-pulse">
                SOS COMMAND CENTER
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-600 dark:text-gray-400 uppercase tracking-wider mt-1.5 font-bold">
              Real-time emergency dispatcher & verification deck
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
  href="/admin"
  className="px-4 py-2 border border-slate-300 bg-white dark:bg-transparent dark:border-slate-850 hover:bg-slate-100 hover:border-slate-400 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
>
  Consultation
</Link>
            <ThemeToggle theme={theme} onToggleTheme={handleToggleTheme} />
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-200/60 dark:bg-slate-950 p-1.5 rounded-2xl max-w-sm border border-slate-200 dark:border-slate-900">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-3 text-center text-xs uppercase tracking-wider font-bold rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "bg-white dark:bg-[#0f1934] text-slate-900 dark:text-white shadow-md font-black"
                : "text-slate-500"
            }`}
          >
            SOS Monitor
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`flex-1 py-3 text-center text-xs uppercase tracking-wider font-bold rounded-xl transition-all ${
              activeTab === "verification"
                ? "bg-white dark:bg-[#0f1934] text-slate-900 dark:text-white shadow-md font-black"
                : "text-slate-500"
            }`}
          >
            Lawyer Verification
          </button>
        </div>

        {/* LOADING STATE */}
        {loadingData ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-red-500 animate-spin"></div>
            Synchronizing database nodes...
          </div>
        ) : (
          <>
            {activeTab === "dashboard" ? (
              <div className="space-y-6">
                
                {/* Statistics panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-400 dark:border-slate-850 shadow-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-700">Active Emergencies</div>
                    <div className="text-2xl font-black text-red-500 mt-1">{activeSOSCount}</div>
                    <div className="text-[9px] text-slate-700 mt-1 uppercase">Dispatch units active</div>
                  </div>
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-400 dark:border-slate-850 shadow-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-700">Cases Completed</div>
                    <div className="text-2xl font-black text-green-500 mt-1">{completedSOSCount}</div>
                    <div className="text-[9px] text-slate-700 mt-1 uppercase">Incidents successfully resolved</div>
                  </div>
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-400 dark:border-slate-850 shadow-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-700">Total Payments Paid</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">₹{totalPaid.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-700 mt-1 uppercase">₹4,500 authorization rate</div>
                  </div>
                </div>

                {/* Active SOS requests management ledger */}
                <div className="w-full">
                  <TelemetryFeedList
                    filteredRequests={filteredRequests}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    adminProfile={adminProfile}
                    openReassignModal={openReassignModal}
                    handleReleasePayment={handleReleasePayment}
                    onViewOrder={setSelectedSOSOrder}
                    onRefresh={fetchData}
                  />
                </div>
              </div>
            ) : (
              <LawyerVerificationRegister
                lawyers={lawyers}
                setVerifyTarget={setVerifyTarget}
              />
            )}
          </>
        )}
      </div>

      {/* --- REASSIGNMENT DIALOG MODAL --- */}
      {reassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#0c142b] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500">Reassign SOS Advocate</h3>
              <button onClick={() => setReassignTarget(null)} className="text-slate-500 hover:text-slate-200 text-sm">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select an available, verified advocate to dispatch for client <b>{reassignTarget.client?.name || "Emergency client"}</b>. 
                The current counsel will be unassigned automatically.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-premium">
              {availableLawyers.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  No verified advocates are currently ONLINE & AVAILABLE.
                </div>
              ) : (
                availableLawyers.map((lawyer) => (
                  <button
                    key={lawyer._id}
                    onClick={() => handleReassignLawyer(lawyer._id)}
                    className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl transition-all flex justify-between items-center group active:scale-98"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">{lawyer.name}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{lawyer.specialty} • {lawyer.experience} yrs exp</div>
                    </div>
                    <span className="text-[9px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Assign
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setReassignTarget(null)}
                className="w-full py-2.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- VERIFICATION CONFIRMATION MODAL --- */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-white dark:bg-[#0c142b] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white mb-2">
              {verifyTarget.currentStatus ? "Revoke Verification?" : "Approve Verification?"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to {verifyTarget.currentStatus ? "revoke" : "approve"} SOS verification for <b>{verifyTarget.name}</b>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setVerifyTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleVerification}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <DetailSosOrderView
        isOpen={Boolean(selectedSOSOrder)}
        order={selectedSOSOrder}
        onClose={() => setSelectedSOSOrder(null)}
      />
    </main>
  );
}
