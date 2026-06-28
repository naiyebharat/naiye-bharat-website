"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, LogOut, Loader2, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop layer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoggingOut && onClose()}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/75"
          />
          
          {/* Modal Modal Window Node */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl z-10"
          >
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Confirm Sign Out</h3>
            </div>
            
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to terminate your current security token session? You will need to re-authenticate to clear live incoming pipelines.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={onClose}
                className="px-4 cursor-pointer py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirm}
                className="px-4 py-2 cursor-pointer rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all min-w-[96px]"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}