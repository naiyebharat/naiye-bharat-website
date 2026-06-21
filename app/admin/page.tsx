'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import StatsCards from './components/StatsCards';
import ExpertForm from './components/ExpertForm';
import ExpertTable from './components/ExpertTable';
import AdminHeader from './components/AdminHeader';
import ThemeToggle from '../advocate/components/ThemeToggle';
import OrdersLedger from './components/OrdersLedger';
import DetailOrderView from "./components/DetailOrderView";

export default function AdminDashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [adminName, setAdminName] = useState<string>("System Admin");

  // Fetch dynamic profile details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setAdminName(data.user.name);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    }
    fetchProfile();
  }, []);

  // Sync state layout adjustments directly into root HTML layers
  useEffect(() => {
    const savedTheme = localStorage.getItem("nb_theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem("nb_theme", "dark");
    } else {
      root.classList.remove('dark');
      localStorage.setItem("nb_theme", "light");
    }
  }, [isDarkMode]);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 dark:bg-[#050b1d] dark:text-white p-4 sm:p-6 font-sans transition-colors duration-500 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 🔥 Custom Admin Mainframe Header Integration */}
        <AdminHeader 
          adminName={adminName}
          toggleElement={
            <ThemeToggle 
              theme={isDarkMode ? "dark" : "light"} 
              onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
            />
          }
        />

        {/* 🔥 Real-Time SOS Command Center Quick Banner */}
        <div className="bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-650 dark:text-red-500 animate-pulse">
              <i className="fas fa-tower-broadcast text-lg"></i>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-red-650 dark:text-red-500 tracking-wider">Emergency SOS Command Center</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Track live SOS incidents, reassign lawyers, verify payouts, and manage advocate permissions.</p>
            </div>
          </div>
          <Link 
            href="/admin/sos" 
            className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all whitespace-nowrap active:scale-95"
          >
            Enter Command Console <i className="fas fa-circle-chevron-right ml-1"></i>
          </Link>
        </div>

        {/* Operational Grid Core Components */}
        <StatsCards />

        <ExpertTable 
          refreshTrigger={refreshTrigger} 
          onAddClick={handleAddClick}
        />
        
        {/* 🔥 Yahan prop pass kiya taaki click tracking dashboard tak pahunche */}
        <OrdersLedger onViewOrder={setSelectedOrder} />

      </div>

      {/* Global Mounted View Component Layer */}
      <DetailOrderView 
        isOpen={Boolean(selectedOrder)} 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />

      {/* Modal Overlay for Form Component Stack */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ExpertForm 
                onSuccess={handleSuccess} 
                onClose={handleCloseForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}