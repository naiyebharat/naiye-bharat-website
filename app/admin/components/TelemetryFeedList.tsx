"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Siren, Eye, Pencil, RotateCw, Search, X, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TelemetryFeedListProps {
  filteredRequests: any[];
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  adminProfile: any;
  openReassignModal: (sos: any) => void;
  handleReleasePayment: (sosId: string) => void;
  onViewOrder: (sos: any) => void;
  onRefresh: () => void;
}

export default function TelemetryFeedList({
  filteredRequests,
  filterStatus,
  setFilterStatus,
  adminProfile,
  openReassignModal,
  handleReleasePayment,
  onViewOrder,
  onRefresh,
}: TelemetryFeedListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dropdown states for Pencil status selector
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Search debounce simulation
  useEffect(() => {
    if (!searchTerm) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 450);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Close dropdown on scroll or resize
  useEffect(() => {
    const close = () => setActiveDropdownId(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  const handlePencilClick = (e: React.MouseEvent<HTMLButtonElement>, sosId: string) => {
    e.stopPropagation();
    if (activeDropdownId === sosId) {
      setActiveDropdownId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX - 120, // offset to show correctly
    });
    setActiveDropdownId(sosId);
  };

  const handleStatusUpdate = async (sosId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/sos-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-status",
          sosId,
          status: newStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        onRefresh();
        setActiveDropdownId(null);
      } else {
        alert(json.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  const handleManualSync = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Filter requests based on Search
  const searchedRequests = filteredRequests.filter((sos) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (sos.client?.name || "").toLowerCase().includes(q) ||
      (sos.emergencyType || "").toLowerCase().includes(q) ||
      (sos.lawyer?.name || "").toLowerCase().includes(q) ||
      (sos.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      {activeDropdownId && (
        <div className="fixed inset-0 z-[90]" onClick={() => setActiveDropdownId(null)} />
      )}

      {/* Pencil Status Dropdown */}
      <AnimatePresence>
        {activeDropdownId && (
          <motion.div
            key={activeDropdownId}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ type: "spring", duration: 0.15 }}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 100,
              minWidth: "160px",
            }}
            className="bg-white dark:bg-[#121b36] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-500">
                Update SOS Status
              </span>
            </div>
            {["pending", "accepted", "en_route", "arrived", "completed"].map((st) => {
              const activeSos = filteredRequests.find(r => r._id === activeDropdownId);
              const isSelected = activeSos?.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusUpdate(activeDropdownId, st)}
                  className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <span className="capitalize">{st.replace("_", " ")}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-white dark:bg-[#0c142b] border border-slate-500 dark:border-slate-850 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-150 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  Telemetry Feed
                </h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Live Emergency Incidents Table
                </p>
              </div>
            </div>

            {/* Controls: Filter + Search + Refresh */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Search input */}
              <div className="relative w-full sm:w-48">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-slate-700" />
                  )}
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full text-xs font-semibold pl-8 pr-7 py-2 bg-slate-50 border border-slate-500 focus:border-red-500 dark:bg-slate-950 dark:border-slate-850 dark:focus:border-red-500/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status filter selection dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-600 dark:border-slate-850 text-[10px] rounded-xl text-slate-600 dark:text-slate-400 uppercase font-extrabold outline-none cursor-pointer"
              >
                <option value="all">All Incidents</option>
                <option value="active">Active Feed</option>
                <option value="pending">Pending Acceptance</option>
                <option value="accepted">Accepted / Dispatched</option>
                <option value="completed">Completed</option>
              </select>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isRefreshing}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-600 dark:border-slate-700 rounded-xl text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all disabled:opacity-50 cursor-pointer"
                title="Sync Feed"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-slate-400">
              <thead>
                <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <th className="pb-3 pt-1">Client Details</th>
                  <th className="pb-3 pt-1">Emergency Type</th>
                  <th className="pb-3 pt-1">Assigned Advocate</th>
                  <th className="pb-3 pt-1">ETA</th>
                  <th className="pb-3 pt-1 text-center">SOS Status</th>
                  <th className="pb-3 pt-1 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/60 text-xs text-slate-750 dark:text-slate-300">
                {searchedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      No active telemetry nodes match search query.
                    </td>
                  </tr>
                ) : (
                  searchedRequests.map((sos) => (
                    <tr key={sos._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 font-extrabold text-slate-900 dark:text-white leading-tight">
                        <div>{sos.client?.name || "Client"}</div>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-300">
                        {sos.emergencyType}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        {sos.lawyer?.name ? `Adv. ${sos.lawyer.name}` : <span className="text-slate-400 font-medium">Unassigned</span>}
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {sos.eta || "N/A"}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border inline-block ${
                          sos.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-500 animate-pulse"
                            : sos.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-400"
                            : "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-500/30 dark:text-blue-500"
                        }`}>
                          {sos.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex justify-end items-center gap-2">
                          {sos.status !== "completed" && sos.status !== "cancelled" && (
                            <button
                              onClick={() => openReassignModal(sos)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border border-slate-200 dark:border-slate-750"
                            >
                              Reassign
                            </button>
                          )}
                          <button
                            onClick={() => onViewOrder(sos)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handlePencilClick(e, sos._id)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Update Status"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
