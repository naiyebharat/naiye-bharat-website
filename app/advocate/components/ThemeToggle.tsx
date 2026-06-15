"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function ThemeToggle({ theme, onToggleTheme }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className="relative w-14 h-8 rounded-full bg-slate-200 dark:bg-[#121b36] border border-slate-300/60 dark:border-slate-800/80 p-1 flex items-center cursor-pointer transition-colors duration-300 select-none shadow-inner"
      aria-label="Toggle Display Theme Layer"
    >
      {/* 🛝 THEME TRACK SLIDER ICON COMPONENT */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        animate={{
          x: isDark ? 24 : 0, // Switch horizontal path track directly
        }}
        className="w-6 h-6 rounded-full bg-white dark:bg-[#00c2a8] flex items-center justify-center shadow-md border border-slate-200/40 dark:border-emerald-400/20"
      >
        {/* 🔄 ICON ROTATION TRACK OVERLAY ENGINE */}
        <motion.div
          key={theme} // Key changes trigger an absolute fresh spin animation on change
          initial={{ rotate: -180, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 180, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-slate-700 dark:text-[#050b1d]"
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-[#050b1d]" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}