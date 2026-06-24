"use client";

import React from "react";
import { Briefcase, MessageSquare, Eye } from "lucide-react";

export interface CaseOrder {
  id: string;
  advocateName: string;
  specialty: string;
  lastMessageSnippet: string;
  status: "ACTIVE" | "PENDING" | "COMPLETED";
  timestamp: string;
  clientName?: string;
  clientAge?: number;
  email?: string;
  phoneNumber?: string;
  language?: string;
  sessionCost?: number;
  razorpayOrderId?: string;
  issueDescription?: string;
  selectedDate?: string;
  selectedTimeSlot?: string;
}

interface OrderListProps {
  cases: CaseOrder[];
  activeCaseId: string | null;
  onSelectCase: (id: string) => void;
  onViewDetails: (item: CaseOrder) => void; // 🔥 Bubbles the data node to the root layout
}

export default function OrderList({ cases, activeCaseId, onSelectCase, onViewDetails }: OrderListProps) {
  return (
    <aside className={`w-full md:w-[320px] lg:w-[360px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050b1d] flex-col h-full transition-colors duration-300 flex-shrink-0 ${
      activeCaseId ? "hidden md:flex" : "flex"
    }`}>
      {/* Section Header Line */}
      <div className="p-4 border-b border-slate-400 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              My Applied Cases
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-[#00c2a8] tracking-widest uppercase">
                Live Secure Pipeline
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-800/60">
            {cases.length} Total
          </span>
        </div>
      </div>

      {/* Orders Map Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-premium">
        {cases.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-slate-500 uppercase tracking-wide">
            No dynamic case nodes found.
          </div>
        ) : (
          cases.map((item) => {
            const isActive = item.id === activeCaseId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectCase(item.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                  isActive
                    ? "bg-emerald-50/10 dark:bg-slate-900/30 border-emerald-500 dark:border-[#00c2a8] shadow-lg shadow-emerald-500/5"
                    : "bg-white dark:bg-[#0b1329]/40 border-slate-400 dark:border-slate-800/60 hover:border-slate-700 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-[#0b1329]/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-[#00c2a8] flex items-center justify-center text-white dark:text-[#050b1d] font-black text-xs tracking-wider shadow-sm flex-shrink-0">
                    {item.advocateName.startsWith("Adv. ") 
                      ? item.advocateName.replace("Adv. ", "").substring(0, 2) 
                      : item.advocateName.substring(0, 2)}
                  </div>

                  <div className="flex-grow min-w-0 pr-14">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-[#00c2a8] transition-colors">
                        {item.advocateName}
                      </h4>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 mt-0.5 truncate flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400 flex-shrink-0" /> {item.specialty}
                    </p>

                    <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/80 my-2" />

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 truncate flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-500 dark:text-slate-400 flex-shrink-0" /> {item.lastMessageSnippet}
                      </p>
                      <span className="text-[9px] font-extrabold text-slate-600 dark:text-slate-500 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corner Action Block */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide ${
                    item.status === "ACTIVE"
                      ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-[#00c2a8]"
                      : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500"
                  }`}>
                    {item.status}
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(item); // 🔥 Triggers global root drawer overlay
                    }}
                    className="cursor-pointer p-1 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-[#00c2a8] border border-slate-200 dark:border-slate-800 transition-colors"
                    title="View My Case Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}