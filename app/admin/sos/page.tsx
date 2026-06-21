"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { pusherClient } from "@/utils/libs/pusherClient";
import ThemeToggle from "../../advocate/components/ThemeToggle";

export default function AdminSOSPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [adminProfile, setAdminProfile] = useState<any | null>(null);

  // Data states
  const [sosRequests, setSosRequests] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [availableLawyers, setAvailableLawyers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // UI tabs and filters
  const [activeTab, setActiveTab] = useState<"dashboard" | "verification">("dashboard");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Reassignment Modal State
  const [reassignTarget, setReassignTarget] = useState<any | null>(null);

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
  const handleToggleVerification = async (advocateId: string, currentStatus: boolean) => {
    try {
      const res = await axios.post("/api/admin/sos-actions", {
        action: "toggle-verification",
        advocateId,
        verify: !currentStatus,
      });
      if (res.data.success) {
        alert(`Verification status updated successfully for advocate.`);
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
              <span className="text-[10px] font-black bg-red-50 text-red-700 border border-red-200/60 px-2.5 py-1 rounded-md dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 uppercase tracking-widest animate-pulse">
                SOS COMMAND CENTER
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider mt-1.5 font-bold">
              Real-time emergency dispatcher & verification deck
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Consultation Console
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
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            SOS Monitor
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`flex-1 py-3 text-center text-xs uppercase tracking-wider font-bold rounded-xl transition-all ${
              activeTab === "verification"
                ? "bg-white dark:bg-[#0f1934] text-slate-900 dark:text-white shadow-md font-black"
                : "text-slate-500 hover:text-slate-200"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Active Emergencies</div>
                    <div className="text-2xl font-black text-red-500 mt-1">{activeSOSCount}</div>
                    <div className="text-[9px] text-slate-500 mt-1 uppercase">Dispatch units active</div>
                  </div>
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Cases Completed</div>
                    <div className="text-2xl font-black text-green-500 mt-1">{completedSOSCount}</div>
                    <div className="text-[9px] text-slate-500 mt-1 uppercase">Incidents successfully resolved</div>
                  </div>
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Payments Paid</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">₹{totalPaid.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500 mt-1 uppercase">₹4,500 authorization rate</div>
                  </div>
                  <div className="bg-white dark:bg-[#0c142b] p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Admin Commission (20%)</div>
                    <div className="text-2xl font-black text-emerald-500 mt-1">₹{totalCommission.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500 mt-1 uppercase">Commission pool generated</div>
                  </div>
                </div>

                {/* Dashboard layout grid: Map + Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Overview map */}
                  <div className="lg:col-span-7 bg-white dark:bg-[#0c142b] border border-slate-200 dark:border-slate-850 rounded-[30px] p-5 shadow-sm min-h-[350px] flex flex-col justify-between overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-3 flex items-center gap-2">
                      <i className="fas fa-satellite-dish text-red-500 animate-pulse"></i> Telemetry Incident Tracking Map
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850 h-[300px]">
                      <div id={mapContainerId} className="w-full h-full bg-slate-900" />
                    </div>
                  </div>

                  {/* Active SOS requests management ledger */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#0c142b] border border-slate-200 dark:border-slate-850 rounded-[30px] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Telemetry Feed</h3>
                        
                        {/* Status filter selection dropdown */}
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-[10px] rounded-lg text-slate-400 uppercase font-bold outline-none"
                        >
                          <option value="all">All Incidents</option>
                          <option value="active">Active Feed</option>
                          <option value="pending">Pending Acceptance</option>
                          <option value="accepted">Accepted / Dispatched</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="space-y-4 max-h-[320px] overflow-y-auto scrollbar-premium pr-2">
                        {filteredRequests.length === 0 ? (
                          <div className="text-center py-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            No telemetry nodes match search filters.
                          </div>
                        ) : (
                          filteredRequests.map((sos) => (
                            <div key={sos._id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex flex-col gap-3 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{sos.client?.name || "Client"}</h4>
                                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{sos.emergencyType}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                  sos.status === "pending"
                                    ? "bg-red-950/20 border-red-500/30 text-red-500 animate-pulse"
                                    : sos.status === "completed"
                                    ? "bg-green-950/20 border-green-500/30 text-green-400"
                                    : "bg-amber-950/20 border-amber-500/30 text-amber-500"
                                }`}>
                                  {sos.status}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 pt-2 border-t border-slate-100 dark:border-slate-900">
                                <div>
                                  Lawyer: <span className="font-bold text-slate-200">{sos.lawyer?.name || "Unassigned"}</span>
                                </div>
                                <div>
                                  ETA: <span className="font-mono text-amber-500">{sos.eta || "N/A"}</span>
                                </div>
                              </div>

                              {/* Admin control panel options per card */}
                              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                                {sos.status !== "completed" && sos.status !== "cancelled" && (
                                  <button
                                    onClick={() => openReassignModal(sos)}
                                    className="px-3 py-1.5 bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all"
                                  >
                                    Reassign Counsel
                                  </button>
                                )}
                                {sos.status === "completed" && !sos.paymentReleased && (
                                  <button
                                    onClick={() => handleReleasePayment(sos._id)}
                                    className="px-3 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-[9px] uppercase tracking-wider font-bold shadow-md transition-all"
                                  >
                                    Release ₹3,600 Payout
                                  </button>
                                )}
                                {sos.paymentReleased && (
                                  <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="fas fa-circle-check"></i> Payout Released
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              // LAWYER VERIFICATION TAB
              <div className="bg-white dark:bg-[#0c142b] border border-slate-200 dark:border-slate-850 rounded-[30px] p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500">Lawyer SOS Verification Register</h3>
                  <p className="text-xs text-slate-400 mt-1">Approve or revoke verification keys for lawyers, qualifying them to access real-time dispatch feeds.</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-900 scrollbar-premium">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 text-[9px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 dark:border-slate-900">
                        <th className="p-4">Advocate Name</th>
                        <th className="p-4">Email / Phone</th>
                        <th className="p-4">Specialty / Experience</th>
                        <th className="p-4">SOS status</th>
                        <th className="p-4 text-right">Emergency verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                      {lawyers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            No advocates registered in network.
                          </td>
                        </tr>
                      ) : (
                        lawyers.map((lawyer) => (
                          <tr key={lawyer._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                            <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{lawyer.name}</td>
                            <td className="p-4 font-mono text-[10px] text-slate-400">
                              <div>{lawyer.email}</div>
                              <div className="mt-0.5">{lawyer.phoneNumber}</div>
                            </td>
                            <td className="p-4 text-slate-500">
                              <div>{lawyer.specialty}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{lawyer.experience} yrs exp</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                lawyer.sosStatus === "available"
                                  ? "bg-green-950/20 border-green-500/30 text-green-400"
                                  : lawyer.sosStatus === "busy"
                                  ? "bg-amber-950/20 border-amber-500/30 text-amber-500"
                                  : "bg-slate-900 border-slate-800 text-slate-500"
                              }`}>
                                {lawyer.sosStatus || "offline"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleToggleVerification(lawyer._id, lawyer.isVerifiedSOS)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all border ${
                                  lawyer.isVerifiedSOS
                                    ? "bg-green-600 border-green-500 text-white shadow-md hover:bg-green-700"
                                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {lawyer.isVerifiedSOS ? "Verified" : "Unverified"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
    </main>
  );
}
