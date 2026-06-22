// @ts-nocheck
"use client";

import React from "react";

interface IncomingSOSAlertProps {
  incomingSOS: {
    sosId: string;
    emergencyType: string;
    distance: string | number;
    payout: number;
  };
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingSOSAlert({ incomingSOS, onAccept, onReject }: IncomingSOSAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-500 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_80px_rgba(239,68,68,0.3)] animate-sos-pulse relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-shimmer"></div>

        <div className="w-16 h-16 bg-red-950/60 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse text-2xl shadow-xl">
          <i className="fas fa-triangle-exclamation"></i>
        </div>

        <div>
          <span className="px-3 py-1 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full text-[9px] font-bold tracking-widest uppercase">
            EMERGENCY ALERT BROADCAST
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mt-3">{incomingSOS.emergencyType}</h3>
          <p className="text-slate-400 text-xs mt-1">A client requires immediate dispatch and field defense counsel.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
          <div className="text-left">
            <div className="text-[8px] uppercase tracking-wider text-slate-500">Client Distance</div>
            <div className="text-lg font-black text-white font-mono mt-0.5">{incomingSOS.distance} km</div>
          </div>
          <div className="text-left border-l border-slate-850 pl-4">
            <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold text-green-500">Est. Payout (80%)</div>
            <div className="text-lg font-black text-green-400 font-mono mt-0.5">₹{incomingSOS.payout}</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="w-1/3 py-3 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="w-2/3 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
          >
            Accept & Dispatch <i className="fas fa-bolt"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
