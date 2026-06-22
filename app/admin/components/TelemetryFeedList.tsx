"use client";

import React from "react";
import ZegoCallWidget from "@/components/ZegoCallWidget";

interface TelemetryFeedListProps {
  filteredRequests: any[];
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  adminProfile: any;
  openReassignModal: (sos: any) => void;
  handleReleasePayment: (sosId: string) => void;
}

export default function TelemetryFeedList({
  filteredRequests,
  filterStatus,
  setFilterStatus,
  adminProfile,
  openReassignModal,
  handleReleasePayment,
}: TelemetryFeedListProps) {
  return (
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

        <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-premium pr-2">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              No telemetry nodes match search filters.
            </div>
          ) : (
            filteredRequests.map((sos) => (
              <div key={sos._id} className="py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 flex flex-col gap-2 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/40 px-2 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{sos.client?.name || "Client"}</h4>
                    <div className="text-[10px] text-slate-600 dark:text-slate-500 mt-0.5 font-semibold truncate max-w-[150px]">{sos.emergencyType}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                    sos.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-500 animate-pulse"
                      : sos.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-400"
                      : "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-500/30 dark:text-blue-500"
                  }`}>
                    {sos.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  <div>
                    Lawyer: <span className="font-bold text-slate-800 dark:text-slate-200">{sos.lawyer?.name || "Unassigned"}</span>
                  </div>
                  <div>
                    ETA: <span className="font-mono text-emerald-600 dark:text-emerald-400">{sos.eta || "N/A"}</span>
                  </div>
                </div>

                {/* Admin control panel options per card */}
                <div className="flex justify-end gap-2 mt-1">
                  {sos.status !== "completed" && sos.status !== "cancelled" && (
                    <ZegoCallWidget
                      sosId={sos._id}
                      user={adminProfile ? { id: adminProfile.id, name: adminProfile.name, role: "admin" } : null}
                      peerLabel={sos.lawyer?.name ? `Adv. ${sos.lawyer.name}` : sos.client?.name || "SOS party"}
                      compact
                    />
                  )}
                  {sos.status !== "completed" && sos.status !== "cancelled" && (
                    <button
                      onClick={() => openReassignModal(sos)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all"
                    >
                      Reassign
                    </button>
                  )}
                  {sos.status === "completed" && !sos.paymentReleased && (
                    <button
                      onClick={() => handleReleasePayment(sos._id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] uppercase tracking-wider font-bold shadow-md transition-all"
                    >
                      Release Payout
                    </button>
                  )}
                  {sos.paymentReleased && (
                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
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
  );
}
