"use client";

import Link from "next/link";
import { useState } from "react";

export default function GlobalSOS() {
  const [isVisible] = useState(true);

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-50"
      }`}
    >
      <Link 
        href="/emergency" 
        className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-emergency shadow-[0_20px_50px_rgba(185,28,28,0.4)] transition-all duration-500 hover:scale-110 hover:bg-emergency-hover animate-halo"
      >
        {/* Modern SOS Iconography */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white">
          <i className="fas fa-bolt-lightning text-xl mb-0.5 animate-pulse"></i>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase">SOS</span>
        </div>

        {/* Glass Ring Border */}
        <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-90 group-hover:scale-100 transition-transform duration-500"></div>
        
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
        
        {/* Label Tooltip (Desktop Only) */}
        <div className="absolute right-full mr-6 py-2 px-4 bg-oxford-900 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 hidden md:block whitespace-nowrap shadow-2xl">
          Emergency Response Dashboard
        </div>
      </Link>
    </div>
  );
}
