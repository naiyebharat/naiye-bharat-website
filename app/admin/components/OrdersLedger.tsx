// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  History,
  Eye,
  Languages,
  RotateCw,
  Pencil,
  Search,
  AlertTriangle,
  X,
  CheckCircle2,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderData {
  _id: string;
  clientName: string;
  clientAge?: number;
  email: string;
  phoneNumber: string;
  specialty: string;
  language: string;
  issueDescription?: string;
  sessionCost: number;
  paymentStatus: string;
  isVerified: boolean;
  status: string;
  consultationStatus?: "pending" | "completed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  expertId?: { name: string; avatar?: string };
}

interface OrdersLedgerProps {
  onViewOrder: (order: OrderData) => void;
}

interface DropdownPos {
  top: number;
  right: number;
}

export default function OrdersLedger({ onViewOrder }: OrdersLedgerProps) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Dropdown state — fixed position portal style
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0, right: 0 });

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    status: "pending" | "completed";
    clientName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch orders ────────────────────────────────────────
  const fetchOrders = async (isManualSync = false) => {
    if (isManualSync) setIsRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── Search debounce ─────────────────────────────────────
  useEffect(() => {
    if (!searchTerm) { setIsSearching(false); return; }
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Close dropdown on scroll / resize ──────────────────
  useEffect(() => {
    const close = () => setActiveDropdownId(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  // ── Open dropdown: calculate fixed position from button ─
  const handlePencilClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, orderId: string) => {
      e.stopPropagation();

      if (activeDropdownId === orderId) {
        setActiveDropdownId(null);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
      setActiveDropdownId(orderId);
    },
    [activeDropdownId]
  );

  // ── Filtered orders ─────────────────────────────────────
const filteredOrders = orders.filter((order) => {
  const q = searchTerm.toLowerCase().trim();
  if (!q) return true;

  // Session fee — "899" ya "₹899" dono se search ho
  const feeString = String(order.sessionCost || 0);

  // Date — "30 May" ya "09:40" format mein search ho
  const dateString = new Date(order.createdAt)
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    .toLowerCase();

  // Consultation status fallback
  const statusString = (order.consultationStatus || "pending").toLowerCase();

  return (
    order.clientName?.toLowerCase().includes(q) ||
    order.email?.toLowerCase().includes(q) ||
    order.phoneNumber?.toLowerCase().includes(q) ||
    order.expertId?.name?.toLowerCase().includes(q) ||
    order.specialty?.toLowerCase().includes(q) ||
    order.language?.toLowerCase().includes(q) ||
    feeString.includes(q) ||          // ← price search: "899"
    dateString.includes(q) ||         // ← date search: "30 may"
    statusString.includes(q)          // ← status search: "pending" / "completed"
  );
});

  // ── Status update ───────────────────────────────────────
  const handleStatusUpdateSubmit = async () => {
    if (!pendingStatusChange) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingStatusChange.orderId,
          consultationStatus: pendingStatusChange.status,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === pendingStatusChange.orderId
              ? { ...o, consultationStatus: pendingStatusChange.status }
              : o
          )
        );
        setShowConfirmModal(false);
        setPendingStatusChange(null);
      } else {
        alert(json.error || "Status update failed.");
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Status badge helper ─────────────────────────────────
  const StatusBadge = ({ status }: { status?: string }) => {
    const isCompleted = status === "completed";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border ${
          isCompleted
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
            : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          }`}
        />
        {status || "pending"}
      </span>
    );
  };

  return (
    <>
      {/* ── Global click-away for dropdown ─────────────────── */}
      {activeDropdownId && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setActiveDropdownId(null)}
        />
      )}

      {/* ── Fixed-position dropdown (portal style) ─────────── */}
      <AnimatePresence>
        {activeDropdownId && (
          <motion.div
            key={activeDropdownId}
            initial={{ opacity: 0, scale: 0.88, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ type: "spring", duration: 0.2, bounce: 0.15 }}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              right: dropdownPos.right,
              zIndex: 100,
              minWidth: "176px",
            }}
            className="
              bg-white dark:bg-[#1a2640]
              border border-slate-200 dark:border-slate-700/60
              rounded-2xl
              shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
              overflow-hidden
              py-1
            "
          >
            {/* Header label */}
            <div className="px-4 pt-2.5 pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500">
                Update Status
              </p>
            </div>

            {/* Mark Pending */}
            <button
              onClick={() => {
                const order = orders.find((o) => o._id === activeDropdownId);
                if (!order) return;
                setActiveDropdownId(null);
                setPendingStatusChange({
                  orderId: order._id,
                  status: "pending",
                  clientName: order.clientName,
                });
                setShowConfirmModal(true);
              }}
              className="
                w-full px-4 py-2.5
                flex items-center gap-3
                text-[12px] font-semibold
                text-slate-700 dark:text-slate-200
                hover:bg-amber-50 dark:hover:bg-amber-950/30
                hover:text-amber-700 dark:hover:text-amber-400
                transition-colors duration-150
                cursor-pointer
              "
            >
              <span className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </span>
              <span>Mark Pending</span>
            </button>

            {/* Mark Completed */}
            <button
              onClick={() => {
                const order = orders.find((o) => o._id === activeDropdownId);
                if (!order) return;
                setActiveDropdownId(null);
                setPendingStatusChange({
                  orderId: order._id,
                  status: "completed",
                  clientName: order.clientName,
                });
                setShowConfirmModal(true);
              }}
              className="
                w-full px-4 py-2.5
                flex items-center gap-3
                text-[12px] font-semibold
                text-slate-700 dark:text-slate-200
                hover:bg-emerald-50 dark:hover:bg-emerald-950/30
                hover:text-emerald-700 dark:hover:text-emerald-400
                transition-colors duration-150
                cursor-pointer
              "
            >
              <span className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </span>
              <span>Mark Completed</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Card ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-[#0b1329] border border-slate-500 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col h-full min-h-[520px] max-h-[650px] transition-all relative"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-slate-300 dark:border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-[#00c2a8]" />
            <div>
              <h2 className="text-md font-bold text-slate-900 dark:text-white">
                All Consultation Orders
              </h2>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Track paid case entries, client configurations, and session logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:flex-none justify-end">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-slate-700" />
                )}
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-full text-xs font-semibold pl-9 pr-8 py-2 bg-slate-50 border border-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 dark:bg-[#050b1d] dark:border-slate-800 dark:focus:border-[#00c2a8] dark:focus:ring-[#00c2a8]/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={loading || isRefreshing}
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#050b1d] dark:hover:bg-slate-900 border border-slate-600 dark:border-slate-800 rounded-xl text-slate-700 hover:text-emerald-600 dark:hover:text-[#00c2a8] transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
              title="Refresh"
            >
              <RotateCw
                className={`w-4 h-4 transition-transform ${
                  isRefreshing ? "animate-spin text-emerald-500 dark:text-[#00c2a8]" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-premium">
          {loading && !isRefreshing ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 dark:border-t-[#00c2a8] animate-spin" />
              </div>
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest animate-pulse uppercase">
                Loading Orders...
              </span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {searchTerm ? "No matching orders found." : "No orders captured yet."}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="w-full overflow-x-auto"
            >
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-[#0b1329] z-10">
                  <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                    <th className="pb-3 pt-1">Client Details</th>
                    <th className="pb-3 pt-1">Assigned Advocate</th>
                    <th className="pb-3 pt-1">Specialty</th>
                    <th className="pb-3 pt-1">Language</th>
                    <th className="pb-3 pt-1">Session Fee</th>
                    <th className="pb-3 pt-1">Intake Time</th>
                    <th className="pb-3 pt-1 text-center">Status</th>
                    <th className="pb-3 pt-1 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order, idx) => (
                      <motion.tr
                        key={order._id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.18 }}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        {/* Client */}
                        <td className="py-3.5">
                          <p className="font-extrabold text-slate-900 dark:text-white leading-tight">
                            {order.clientName}
                          </p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-0.5 font-semibold truncate max-w-[150px]">
                            {order.email}
                          </p>
                        </td>

                        {/* Advocate */}
                        <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">
                          {order.expertId?.name ? (
                            `Adv. ${order.expertId.name}`
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-medium">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Specialty */}
                        <td className="py-3.5">
                          <span className="text-[9px] font-black bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 uppercase px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 tracking-wide">
                            {order.specialty}
                          </span>
                        </td>

                        {/* Language */}
                        <td className="py-3.5">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            <Languages className="w-3.5 h-3.5 text-slate-500" />
                            {order.language || "N/A"}
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="py-3.5 font-black text-slate-900 dark:text-[#00c2a8]">
                          ₹{order.sessionCost || 0}
                        </td>

                        {/* Time */}
                        <td className="py-3.5 text-slate-700 dark:text-slate-500 font-semibold">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 text-center">
                          <StatusBadge status={order.consultationStatus} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 text-right pr-2">
                          <div className="inline-flex items-center gap-1">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => onViewOrder(order)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 dark:hover:text-[#00c2a8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit / Pencil */}
                            <button
                              type="button"
                              onClick={(e) => handlePencilClick(e, order._id)}
                              className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                                activeDropdownId === order._id
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800  text-emerald-600 dark:text-emerald-400 scale-105"
                                  : "border-transparent text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white"
                              }`}
                              title="Update Status"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          )}

          {/* End marker */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 mb-2 flex items-center justify-center gap-3 opacity-60">
              <div className="h-px bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700 flex-1" />
              <span className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-[#00c2a8] rounded-full" />
                End of Records
              </span>
              <div className="h-px bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700 flex-1" />
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Confirm Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmModal && pendingStatusChange && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setShowConfirmModal(false)}
            />

            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", duration: 0.25 }}
              className="relative z-10 bg-white dark:bg-[#0d1829] rounded-2xl border border-slate-200 dark:border-slate-700/60 max-w-sm w-full p-6 shadow-2xl text-center"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  pendingStatusChange.status === "completed"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-100 dark:border-emerald-900"
                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-500 border border-amber-100 dark:border-amber-900"
                }`}
              >
                {pendingStatusChange.status === "completed" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Update Consultation Status?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 px-2">
                Mark{" "}
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {pendingStatusChange.clientName}
                </span>
                's consultation as{" "}
                <span
                  className={`font-black uppercase tracking-wider ${
                    pendingStatusChange.status === "completed"
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                >
                  {pendingStatusChange.status}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#050b1d] dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleStatusUpdateSubmit}
                  className={`flex-1 py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                    pendingStatusChange.status === "completed"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Confirm"
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