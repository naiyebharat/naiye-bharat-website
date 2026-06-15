"use client";

import React, { useEffect, useState } from "react";
import {
  RotateCw,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpertTable({
  refreshTrigger,
  onAddClick,
}: {
  refreshTrigger: number;
  onAddClick: () => void;
}) {
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🗑️ Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetExpert, setTargetExpert] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔄 Availability Toggle Confirmation Modal State
  const [availModalOpen, setAvailModalOpen] = useState(false);
  const [targetAvailExpert, setTargetAvailExpert] = useState<{
    id: string;
    name: string;
    currentStatus: boolean;
  } | null>(null);
  const [isTogglingAvail, setIsTogglingAvail] = useState(false);

  // Bottom-Left Toast Notification State Hub
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // API Fetch Logic
  const fetchExperts = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/add-advocate");
      if (res.ok) {
        const data = await res.json();
        setAdvocates(data);
      } else {
        console.error("404 ya Fetch routing issue mila backend route par.");
      }
    } catch (err) {
      console.error("Network boundary connectivity logic failed:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, [refreshTrigger]);

  const handleManualRefresh = () => {
    fetchExperts(true);
  };

  // --- Deletion Flow ---
  const handleDeleteClick = (id: string, name: string) => {
    setTargetExpert({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetExpert) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/delete-advocate/${targetExpert.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setDeleteModalOpen(false);
        triggerToast(
          `"${targetExpert.name}" successfully wiped out from system layers! 🗑️`,
          "success",
        );
        setTargetExpert(null);
        fetchExperts();
      } else {
        const err = await response.json();
        triggerToast(err.error || "Deletion tracking engine failed", "error");
      }
    } catch (error) {
      triggerToast("Network transaction processing timeout.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Availability Toggle Flow ---
  const handleToggleClick = (
    id: string,
    name: string,
    currentStatus: boolean,
  ) => {
    setTargetAvailExpert({ id, name, currentStatus });
    setAvailModalOpen(true);
  };

  const confirmToggleAvailability = async () => {
    if (!targetAvailExpert) return;
    setIsTogglingAvail(true);

    const nextStatus = !targetAvailExpert.currentStatus;

    try {
      const response = await fetch(
        `/api/admin/delete-advocate/${targetAvailExpert.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAvailable: nextStatus }),
        },
      );

      if (response.ok) {
        setAvailModalOpen(false);
        triggerToast(
          `"${targetAvailExpert.name}" availability is now set to ${nextStatus ? "Active" : "Inactive"}! 🔄`,
          "success",
        );
        setTargetAvailExpert(null);
        fetchExperts(); // Live sync database mapping
      } else {
        const err = await response.json();
        triggerToast(err.error || "Availability sync failed", "error");
      }
    } catch (error) {
      triggerToast("Network patch execution timed out.", "error");
    } finally {
      setIsTogglingAvail(false);
    }
  };

  // ✨ Global Multi-Column Search Filtering Logic
  const filteredAdvocates = advocates.filter((adv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    const nameMatch = adv.name?.toLowerCase().includes(query);
    const emailMatch = adv.email?.toLowerCase().includes(query);
    const phoneMatch = adv.phoneNumber?.toLowerCase().includes(query);
    const specialtyMatch = adv.specialty?.toLowerCase().includes(query);
    const priceMatch = adv.pricing?.toString().includes(query);
    const expMatch = adv.experience?.toString().includes(query);
    const languageMatch = (
      Array.isArray(adv.language) ? adv.language.join(", ") : adv.language
    )
      ?.toLowerCase()
      .includes(query);

    return (
      nameMatch ||
      emailMatch ||
      phoneMatch ||
      specialtyMatch ||
      priceMatch ||
      expMatch ||
      languageMatch
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#0b1329] border border-slate-500 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full min-h-[520px] max-h-[620px] transition-all relative"
    >
      {/* Table Headings Section */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-300 dark:border-slate-800 pb-2 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <Users className="w-5 h-5 text-emerald-600 dark:text-[#00c2a8]" />
          <div>
            <h2 className="hidden md:block text-md font-bold text-slate-800 dark:text-white">
              Master Advocate Database Directory
            </h2>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
              Manage active listings, access secure profiles and logs.
            </p>
          </div>
        </motion.div>

        {/* 🔍 Search Bar + Add Expert + Refresh Buttons Container */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          {/* Global Smart Search Bar Input Field */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-700 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-1.5 w-36 sm:w-48 md:w-64 bg-slate-50 dark:bg-[#050b1d] border border-slate-600 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] text-slate-800 dark:text-slate-200 font-semibold transition-all shadow-inner placeholder:text-slate-600 dark:placeholder:text-slate-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onAddClick}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] dark:hover:bg-[#00ebd0] text-white dark:text-[#050b1d] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Advocate</span>
          </motion.button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-emerald-600 hover:border-emerald-200 dark:bg-[#050b1d] dark:hover:bg-slate-900 border border-slate-600 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            title="Force Sync Directory"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-700 ease-in-out ${isRefreshing ? "animate-spin text-emerald-600 dark:text-[#00c2a8]" : ""}`}
            />
          </button>
        </motion.div>
      </div>

      {/* Main Grid View Box Container */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-premium">
        {loading && !isRefreshing ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 select-none">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800/80"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 dark:border-[#00c2a8] border-t-transparent dark:border-t-transparent animate-spin"></div>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest animate-pulse">
                Loading Live Directories
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
                Synchronizing expert cluster nodes...
              </span>
            </div>
          </div>
        ) : advocates.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
            No Advocates found in directory pipeline.
          </div>
        ) : filteredAdvocates.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
            ❌ No experts matching "{searchQuery}" found.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full overflow-x-auto scrollbar-premium"
          >
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-[#0b1329] z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pt-1">Advocate Profile</th>
                  <th className="pb-3 pt-1">Email</th>
                  <th className="pb-3 pt-1">Phone</th>
                  <th className="pb-3 pt-1">Core Specialty</th>
                  <th className="pb-3 pt-1">Languages</th>
                  <th className="pb-3 pt-1">Session Cost</th>
                  <th className="pb-3 pt-1">Availability</th>
                  <th className="pb-3 pt-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                <AnimatePresence>
                  {filteredAdvocates.map((adv, idx) => (
                    <motion.tr
                      key={adv._id || adv.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      {/* Avatar Profile with Photo & Experience Data */}
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <ExpertAvatar
                            photoUrl={adv.videoUrl}
                            name={adv.name}
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 dark:text-white leading-tight truncate">
                              {adv.name}
                            </h4>
                            <p className="text-[10px] text-emerald-600 dark:text-[#00c2a8] mt-0.5 truncate max-w-[140px] font-bold">
                              {`Exp: ${adv.experience ?? 0} Yrs`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3">
                        <span
                          className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[160px] block"
                          title={adv.email || "N/A"}
                        >
                          {adv.email || "N/A"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3">
                        <span className="text-slate-600 dark:text-slate-400 font-semibold">
                          {adv.phoneNumber || "N/A"}
                        </span>
                      </td>

                      {/* Specialty */}
                      <td className="py-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                            adv.specialty === "Mental Health"
                              ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-transparent"
                              : adv.specialty === "Legal Support" ||
                                  adv.specialty === "Corporate Law"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent"
                                : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-transparent"
                          }`}
                        >
                          {adv.specialty}
                        </span>
                      </td>

                      {/* Languages */}
                      <td
                        className="py-3 text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[120px]"
                        title={
                          Array.isArray(adv.language)
                            ? adv.language.join(", ")
                            : adv.language
                        }
                      >
                        {Array.isArray(adv.language)
                          ? adv.language.join(", ")
                          : adv.language}
                      </td>

                      {/* Cost */}
                      <td className="py-3 font-extrabold text-slate-800 dark:text-[#00c2a8]">
                        ₹{adv.pricing}
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-3">
                        <AvailabilityToggle
                          isAvailable={adv.isAvailable ?? true}
                          onToggle={() =>
                            handleToggleClick(
                              adv._id || adv.id,
                              adv.name,
                              adv.isAvailable ?? true,
                            )
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-right">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleDeleteClick(adv._id || adv.id, adv.name)
                          }
                          className="text-slate-400 hover:text-rose-500 transition-all cursor-pointer p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg inline-block"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}

        {/* End of List Marker */}
        <div className="mt-6 mb-2 flex items-center justify-center gap-3 opacity-80 dark:opacity-50">
          <div className="h-[1px] bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700 flex-1"></div>
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase bg-emerald-50/20 border border-emerald-100/50 dark:bg-slate-900 dark:border-slate-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-[#00c2a8] rounded-full"></span>
            Advocate Directory Pipeline Ends
          </div>
          <div className="h-[1px] bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700 flex-1"></div>
        </div>
      </div>

      {/* 🗑️ MODAL 1: CONFIRM PROFILE DELETION OVERLAY */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-md font-bold text-slate-800 dark:text-white">
                  Confirm Data Deletion
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-slate-800 dark:text-white">
                  "{targetExpert?.name}"
                </span>{" "}
                from the database? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Record"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔄 MODAL 2: CONFIRM AVAILABILITY STATUS TOGGLE OVERLAY */}
      <AnimatePresence>
        {availModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-emerald-600 dark:text-[#00c2a8]">
                <span className="text-xl">🔄</span>
                <h3 className="text-md font-bold text-slate-800 dark:text-white">
                  Update Availability
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to update the profile status of{" "}
                <span className="font-extrabold text-slate-800 dark:text-white">
                  "{targetAvailExpert?.name}"
                </span>{" "}
                to{" "}
                <span
                  className={`font-bold ${
                    targetAvailExpert?.currentStatus
                      ? "text-rose-500"
                      : "text-emerald-500"
                  }`}
                >
                  {targetAvailExpert?.currentStatus
                    ? "Unavailable (Inactive)"
                    : "Available (Active)"}
                </span>
                ?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setAvailModalOpen(false)}
                  disabled={isTogglingAvail}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={confirmToggleAvailability}
                  disabled={isTogglingAvail}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] dark:hover:bg-[#00c290] text-white dark:text-[#050b1d] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isTogglingAvail ? "Updating..." : "Yes, Change Status"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM-LEFT SLIDE-UP TOAST COMPONENT */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 z-50 max-w-sm min-w-[320px] flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md bg-white/95 text-slate-900 border-slate-200/80 dark:bg-[#0b1329]/95 dark:text-slate-100 dark:border-slate-800"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-[#00c2a8] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            )}

            <div className="flex-1 text-[11px] font-semibold leading-relaxed">
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Expert Avatar Component with Image Fallback
function ExpertAvatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  const [imageError, setImageError] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-slate-900 border-2 border-emerald-100 dark:border-slate-800 flex items-center justify-center font-bold text-[11px] text-emerald-600 dark:text-[#00c2a8] flex-shrink-0 overflow-hidden"
    >
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </motion.div>
  );
}

// Availability Toggle Component
function AvailabilityToggle({
  isAvailable,
  onToggle,
}: {
  isAvailable: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full p-0.5 transition-colors duration-300 cursor-pointer"
      style={{
        backgroundColor: isAvailable ? "#10b981" : "#ef4444",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        animate={{
          x: isAvailable ? 18 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
