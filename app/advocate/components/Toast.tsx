"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertCircle, Info, CheckCircle, X } from "lucide-react";

export interface ToastData {
  show: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toast: ToastData;
  onClose: () => void;
  autoCloseDuration?: number; // ms, default 3500
}

export default function Toast({ toast, onClose, autoCloseDuration = 3500 }: ToastProps) {
  // Auto-close after duration
  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(onClose, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [toast.show, toast.title, toast.message]);

  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  };

  const styles = {
    success: {
      wrapper: "bg-[#0b1329]/95 border-[#00c2a8]",
      icon: "bg-[#00c2a8]/15 text-[#00c2a8]",
      title: "text-white",
      message: "text-slate-300",
      progress: "bg-[#00c2a8]",
    },
    error: {
      wrapper: "bg-rose-950/95 border-rose-500",
      icon: "bg-rose-500/15 text-rose-400",
      title: "text-rose-100",
      message: "text-rose-300",
      progress: "bg-rose-500",
    },
    info: {
      wrapper: "bg-slate-900/95 border-slate-600",
      icon: "bg-slate-600/20 text-slate-300",
      title: "text-white",
      message: "text-slate-400",
      progress: "bg-slate-500",
    },
  };

  const s = styles[toast.type];

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          key={toast.title + toast.message}
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed top-5 right-5 z-[9999] w-full max-w-sm"
        >
          <div className={`relative overflow-hidden backdrop-blur-xl rounded-2xl p-4 flex items-start gap-3 shadow-2xl border ${s.wrapper}`}>
            {/* Icon */}
            <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${s.icon}`}>
              {icons[toast.type]}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
              <h4 className={`text-sm font-black tracking-tight leading-tight ${s.title}`}>
                {toast.title}
              </h4>
              <p className={`text-xs font-medium mt-1 leading-relaxed break-words ${s.message}`}>
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Auto-close progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoCloseDuration / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className={`absolute bottom-0 left-0 right-0 h-[3px] ${s.progress} opacity-60`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}