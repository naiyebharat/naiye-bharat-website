"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, Mail, Languages, CreditCard, FileText, X, ShieldAlert } from "lucide-react";

interface OrderData {
  _id?: string;
  id?: string;
  clientName: string;
  email: string;
  expertId?: { name: string } | null;
  specialty: string;
  language?: string;
  sessionCost?: number;
  amount?: number;
  createdAt: string | Date;
  clientAge?: number;
  phoneNumber?: string;
  razorpayOrderId?: string;
  issueDescription?: string;
  selectedDate?: string;
  selectedTimeSlot?: string;
}

interface DetailOrderViewProps {
  isOpen: boolean;
  order: OrderData | null;
  onClose: () => void;
}

export default function DetailOrderView({ isOpen, order, onClose }: DetailOrderViewProps) {
  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      {/* Outer Main Frame Overlay */}
      <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden outline-none">
        
        {/* Backdrop Fade Layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        />

        {/* 🔥 FIX: Right-Side Slid-In Drawer Sheet Panel */}
        <motion.div
          initial={{ x: "100%" }} // Starting point: right side screen ke bahar
          animate={{ x: 0 }}       // Slide in view
          exit={{ x: "100%" }}      // Slide out back to right
          transition={{ type: "spring", damping: 30, stiffness: 260 }}
          className="relative bg-white dark:bg-[#0b1329] border-l border-slate-300 dark:border-slate-800 h-full max-w-md w-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto scrollbar-premium z-50"
        >
          {/* Main Top Content Wrapper */}
          <div className="space-y-5 flex-1">
            
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00c2a8] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Ledger Specifications
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                    ID: {order._id || order.id || "N/A"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121b36] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Payload Grid inside Drawer */}
            <div className="space-y-4">
              {/* Box 1: Client Metadata Profile */}
              <div className="bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl space-y-2.5">
                <h4 className="text-[10px] font-black text-emerald-600 dark:text-[#00c2a8] uppercase tracking-wider mb-1">
                  Client Profile Context
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" /> Full Name:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{order.clientName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400" /> Email:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px] truncate max-w-[190px]">
                    {order.email}
                  </span>
                </div>
                {(order.phoneNumber || order.clientAge) && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                      <span className="w-4 text-center">📞</span> Contact / Age:
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                      {order.phoneNumber || "N/A"} {order.clientAge ? `(${order.clientAge} Yrs)` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Box 2: System Routing Data */}
              <div className="border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl space-y-2.5">
                <h4 className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">
                  System Routing Data
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" /> Assigned Expert:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {order.expertId?.name ? `Adv. ${order.expertId.name}` : "Unassigned Node"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Languages className="w-4 h-4 text-slate-400" /> Language:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{order.language || "Not Specified"}</span>
                </div>
                {order.selectedDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-slate-400" /> Scheduled Date:
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{order.selectedDate}</span>
                  </div>
                )}
                {order.selectedTimeSlot && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-slate-400" /> Time Slot:
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{order.selectedTimeSlot}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Specialty Core:</span>
                  <span className="text-center font-black text-indigo-600 dark:text-indigo-400 uppercase text-[10px] bg-indigo-55/40 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-900/50 py-1 rounded-md tracking-wider">
                    {order.specialty}
                  </span>
                </div>
              </div>

              {/* Box 3: Financial Token Transaction Logs */}
              <div className="border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl space-y-2.5 bg-amber-500/[0.01] dark:bg-amber-500/[0.03]">
                <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Financial Transaction Log
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Session Fee:
                  </span>
                  <span className="font-black text-emerald-600 dark:text-[#00c2a8] text-sm">
                    ₹{order.sessionCost || order.amount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" /> Intake Time:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Box 4: Issue Context Message Block */}
              <div className="flex flex-col gap-1.5 border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Shared Issue Description
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#050b1d] p-3 rounded-lg leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap border border-slate-200/60 dark:border-slate-800/80 select-text scrollbar-premium">
                  {order.issueDescription || "No manual context logs established by client yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Footer inside Drawer */}
          <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 mt-5">
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest">
              End of Core Record Schema
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}