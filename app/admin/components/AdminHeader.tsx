// @ts-nocheck
"use client";

import React, { useState } from "react";
import { Scale, LogOut, ChevronDown, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminHeaderProps {
  adminName?: string;
  toggleElement: React.ReactNode; // Fancy ThemeToggle element container
}

export default function AdminHeader({ adminName = "System Admin", toggleElement }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = adminName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // 🖱️ Desktop Handlers (Hover View)
  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) setIsDropdownOpen(false);
  };

  // 📱 Mobile Handler (Click/Tap Toggle)
  const handleAvatarClick = () => {
    if (window.innerWidth < 768) setIsDropdownOpen((prev) => !prev);
  };

  // 🚀 Core HTTP Logout Logic Engine
  const handleLogoutActionSubmit = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed network error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="w-full flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5 select-none">
        
        {/* 🏛️ Branding & Sub-bar Context Block */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 dark:bg-[#00c2a8] flex items-center justify-center shadow-md sm:hidden">
              <Scale className="w-3.5 h-3.5 text-white dark:text-[#050b1d]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white uppercase">
              NAIYE <span className="text-emerald-700 dark:text-[#00c2a8]">BHARAT</span>
            </span>
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md dark:bg-emerald-500/10 dark:text-[#00c2a8] dark:border-emerald-500/20 uppercase tracking-widest hidden sm:inline-block">
              Control Room
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider mt-1 font-black hidden md:block">
            COMMUNICATION HUB • MANAGEMENT CONSOLE
          </p>
        </div>

        {/* ⚙️ Control Actions Layer */}
        <div className="flex items-center gap-4">
          
          {/* Dynamic Theme Toggle Slider Hook */}
          {toggleElement}

          {/* 👤 Admin Context Multi-Drop Grid */}
          <div 
            className="relative border-l border-slate-200 dark:border-slate-800 pl-4 py-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleAvatarClick}
              className="flex items-center gap-2.5 cursor-pointer group focus:outline-none bg-transparent border-none"
              type="button"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-black shadow-md ring-2 ring-transparent group-hover:ring-emerald-500/30 dark:group-hover:ring-[#00c2a8]/30 transition-all">
                {initials}
              </div>
              
              <div className="hidden md:block text-left">
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                  {adminName}
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Root Overlord</p>
              </div>
            </button>

            {/* Floating Dropdown Panel */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1934] shadow-xl p-1.5 z-50 origin-top-right"
                >
                  {/* Mobile Identity Context */}
                  <div className="px-2.5 py-2 md:hidden border-b border-slate-100 dark:border-slate-800/60 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{adminName}</p>
                    <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500">System Root</p>
                  </div>

                  {/* Trigger Confirmation Modal instead of immediate session drops */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </header>

      {/* ── PREMIUM ADMIN SIGN-OUT DIALOG MODAL LAYER ── */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Soft Matte Backdrop Blur Ring */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
            />

            {/* Core Interaction Sheet Block */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.22 }}
              className="relative z-10 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl rounded-2xl text-center"
            >
              {/* Alert Visual Anchor */}
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>

              <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-1">
                Terminate Admin Session?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 px-1">
                Bhai, are you sure you want to log out from the main control frame? Any unsaved telemetry configurations might require re-authentication.
              </p>

              {/* Action Handlers Core Wrapper */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#050b1d] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogoutActionSubmit}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-rose-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exiting...</span>
                    </>
                  ) : (
                    <span>Sign Out</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}