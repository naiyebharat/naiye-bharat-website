"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, Mail, ShieldAlert, CreditCard, X, HelpCircle } from "lucide-react";

interface SOSOrderData {
  _id: string;
  emergencyType: string;
  status: string;
  amountPaid: number;
  commission: number;
  payout: number;
  paymentReleased: boolean;
  eta: string;
  createdAt: string | Date;
  client?: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  lawyer?: {
    name: string;
    email: string;
    phoneNumber: string;
    specialty: string;
    experience: number;
  } | null;
}

interface DetailSosOrderViewProps {
  isOpen: boolean;
  order: SOSOrderData | null;
  onClose: () => void;
}

export default function DetailSosOrderView({ isOpen, order, onClose }: DetailSosOrderViewProps) {
  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden outline-none">
        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        />

        {/* Slid-In Drawer Sheet Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 260 }}
          className="relative bg-white dark:bg-[#0b1329] border-l border-slate-300 dark:border-slate-800 h-full max-w-md w-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto scrollbar-premium z-50 text-slate-900 dark:text-white"
        >
          <div className="space-y-5 flex-1">
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-650 dark:text-red-500 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    SOS Ledger Specs
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                    ID: {order._id}
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

            {/* Body */}
            <div className="space-y-4">
              {/* Client Info */}
              <div className="bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl space-y-2.5">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">
                  Emergency Client Info
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" /> Full Name:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{order.client?.name || "Client"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400" /> Email:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px] truncate max-w-[190px]">
                    {order.client?.email || "No Email"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <span className="w-4 text-center">📞</span> Contact Number:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    {order.client?.phoneNumber || "N/A"}
                  </span>
                </div>
              </div>

              {/* Emergency Dispatch Info */}
              <div className="border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl space-y-2.5">
                <h4 className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Emergency Dispatch Details
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" /> Dispatched Advocate:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {order.lawyer?.name ? `Adv. ${order.lawyer.name}` : "Unassigned Node"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" /> Live Status:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" /> Lawyer ETA:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{order.eta || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Emergency Type:</span>
                  <span className="text-center font-black text-red-650 dark:text-red-500 uppercase text-[10px] bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-950/50 py-1.5 rounded-md tracking-wider">
                    {order.emergencyType}
                  </span>
                </div>
              </div>

              {/* Financial Transaction Info */}
              <div className="border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl space-y-2.5 bg-amber-500/[0.01] dark:bg-amber-500/[0.03]">
                <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Financial Transaction Log
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Total Paid Amount:
                  </span>
                  <span className="font-black text-red-650 dark:text-red-500 text-sm">
                    ₹{order.amountPaid}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 mt-1">
                  <span className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" /> Dispatch Time:
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
            </div>
          </div>

          <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 mt-5">
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest">
              End of SOS Record Schema
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
