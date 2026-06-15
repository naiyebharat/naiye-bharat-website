"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Clock, Mail, Phone, Languages, CreditCard, FileText, X } from "lucide-react";
import { CaseOrder } from "./OrderList";

interface CaseDetailsDrawerProps {
  selectedCase: CaseOrder | null;
  onClose: () => void;
}

export default function CaseDetailsDrawer({ selectedCase, onClose }: CaseDetailsDrawerProps) {
  if (!selectedCase) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-xs"
      />
      
      {/* Drawer Body */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="fixed left-0 top-0 bottom-0 h-screen w-full max-w-md bg-white dark:bg-[#0b1329] border-r border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-[1000] scrollbar-premium overflow-y-auto flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00c2a8] flex items-center justify-center font-bold">ID</div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Case Specifications</h3>
                <p className="text-[9px] font-mono text-slate-500 truncate max-w-[200px]">{selectedCase.id}</p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121b36] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Profile Metadata */}
            <div className="bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-emerald-600 dark:text-[#00c2a8] uppercase tracking-wider mb-2">My Profile Details</h4>
              <div className="flex items-center gap-3 text-xs">
                <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Full Name:</span>
                <span className="font-extrabold text-slate-900 dark:text-white ml-auto">{selectedCase.clientName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Age Context:</span>
                <span className="font-extrabold text-slate-900 dark:text-white ml-auto">{selectedCase.clientAge} Yrs</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Email Address:</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto font-mono text-[11px] truncate max-w-[180px]">{selectedCase.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Contact Number:</span>
                <span className="font-extrabold text-slate-900 dark:text-white ml-auto font-mono">{selectedCase.phoneNumber}</span>
              </div>
            </div>

            {/* Consultation Specs */}
            <div className="border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">Consultation Specifications</h4>
              <div className="flex items-center gap-3 text-xs">
                <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Assigned Advocate:</span>
                <span className="font-extrabold text-slate-900 dark:text-white ml-auto">{selectedCase.advocateName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Languages className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Preferred Language:</span>
                <span className="font-extrabold text-slate-900 dark:text-white ml-auto">{selectedCase.language}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-4 h-4 border border-slate-400 dark:border-slate-500 rounded-sm flex items-center justify-center text-[8px] font-bold flex-shrink-0 text-slate-500">sp</div>
                <span className="font-bold text-slate-600 dark:text-slate-400">Core Specialty:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 ml-auto uppercase text-[10px]">{selectedCase.specialty}</span>
              </div>
            </div>

            {/* Payment Data */}
            <div className="border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl space-y-3 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]">
              <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Payment Transaction Log</h4>
              <div className="flex items-center gap-3 text-xs">
                <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Paid Session Fee:</span>
                <span className="font-black text-emerald-600 dark:text-[#00c2a8] ml-auto text-sm">₹{selectedCase.sessionCost}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs pt-1 border-t border-dashed border-slate-200 dark:border-slate-800/80">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Razorpay Order ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-[#050b1d] p-1.5 rounded border border-slate-200 mt-0.5 select-all text-[11px] truncate">{selectedCase.razorpayOrderId}</span>
              </div>
            </div>

            {/* Issue Payload Summary */}
            <div className="flex flex-col gap-1.5 border border-slate-200 dark:border-slate-800/60 p-4 rounded-xl">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> My Shared Issue Description
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#050b1d] p-3 rounded-lg leading-relaxed max-h-[150px] overflow-y-auto whitespace-pre-wrap border border-slate-200/60 select-text">
                {selectedCase.issueDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">End of Case Summary</span>
        </div>
      </motion.div>
    </>
  );
}