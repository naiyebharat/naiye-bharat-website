"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MessageSquare, Clock, Loader2 } from "lucide-react";

export interface ClientRequest {
  id: string;
  roomId?: string;
  name: string;
  issue: string;
  lastMessage: string;
  lastMessageTime: string;
  status: "pending_expert" | "active_discussion" | "closed";
  isAssigned: boolean;
  requestType?: "consultation" | "sos";
  sosId?: string;
  payout?: number;
  lat?: number;
  lng?: number;
}

interface RequestListProps {
  requests: ClientRequest[];
  activeId: string | null;
  onSelect: (client: ClientRequest) => void;
  loading: boolean;
}

const statusConfig = {
  pending_expert: { label: "Waiting", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  active_discussion: { label: "Active", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-[#00c2a8] border-emerald-200 dark:border-emerald-500/20" },
  closed: { label: "Closed", color: "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-700/40" },
};

export default function RequestList({ requests, activeId, onSelect, loading }: RequestListProps) {
  return (
    <div className="w-full h-full border-r border-slate-200 dark:border-slate-800/80 flex flex-col bg-white dark:bg-[#050b1d]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Client Requests</h2>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-[#00c2a8] tracking-widest uppercase mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Live Pipeline Stream
          </p>
        </div>
        <span className="bg-slate-100 dark:bg-[#0b1329] text-slate-700 dark:text-[#00c2a8] border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
          {loading ? "..." : `${requests.length} Active`}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-premium">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500 dark:text-[#00c2a8]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Syncing pipeline...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <span className="text-xs font-semibold text-center text-slate-400 dark:text-slate-500">No pending client requests</span>
          </div>
        ) : (
          requests.map((req) => {
            const sc = statusConfig[req.status] || statusConfig["pending_expert"];
            return (
              <motion.div
                key={req.id}
                whileHover={{ scale: 1.01, y: -1 }}
                onClick={() => onSelect(req)}
                className={`p-4 rounded-xl cursor-pointer select-none border transition-all duration-200 relative overflow-hidden
                  ${activeId === req.id
                    ? "bg-slate-100 dark:bg-[#0b1329] border-emerald-500 dark:border-[#00c2a8] shadow-md"
                    : "bg-white dark:bg-[#0b1329]/40 border-slate-200 dark:border-slate-800/60 hover:border-slate-400 dark:hover:border-slate-700"
                  }`}
              >
                {/* Active indicator */}
                {activeId === req.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 dark:bg-[#00c2a8] rounded-l-xl" />
                )}

                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Avatar initial */}
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-[#00c2a8] flex items-center justify-center text-white dark:text-[#050b1d] font-black text-sm flex-shrink-0">
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{req.name}</h3>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed ml-10">
                  {req.issue}
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-10">
                  <span className="flex items-center gap-1 truncate text-slate-400 dark:text-slate-500">
                    <MessageSquare className="w-3 h-3 text-slate-300 dark:text-[#00c2a8] flex-shrink-0" />
                    <span className="truncate">{req.lastMessage}</span>
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Clock className="w-2.5 h-2.5" />
                    {req.lastMessageTime}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
