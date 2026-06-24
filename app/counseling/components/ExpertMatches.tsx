// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Scale, ShieldCheck, Languages, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import Toast, { ToastData } from "@/app/advocate/components/Toast";
import LoginModal from "./LoginModal";

const LogoSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,2" />
    <rect x="47" y="25" width="6" height="45" fill="#d4af37" />
    <rect x="40" y="65" width="20" height="8" rx="4" fill="#d4af37" />
    <rect x="44" y="20" width="12" height="6" rx="3" fill="#d4af37" />
    <rect x="30" y="35" width="40" height="3" fill="#d4af37" />
    <circle cx="38" cy="40" r="2" fill="#d4af37" />
    <line x1="38" y1="42" x2="38" y2="55" stroke="#d4af37" strokeWidth="1" />
    <line x1="38" y1="42" x2="32" y2="48" stroke="#d4af37" strokeWidth="1" />
    <line x1="38" y1="42" x2="44" y2="48" stroke="#d4af37" strokeWidth="1" />
    <path d="M 30 48 Q 38 55 46 48 L 46 52 Q 38 59 30 52 Z" fill="#d4af37" />
    <circle cx="62" cy="40" r="2" fill="#d4af37" />
    <line x1="62" y1="42" x2="62" y2="55" stroke="#d4af37" strokeWidth="1" />
    <line x1="62" y1="42" x2="56" y2="48" stroke="#d4af37" strokeWidth="1" />
    <line x1="62" y1="42" x2="68" y2="48" stroke="#d4af37" strokeWidth="1" />
    <path d="M 54 48 Q 62 55 70 48 L 70 52 Q 62 59 54 52 Z" fill="#d4af37" />
  </svg>
);

interface Expert {
  _id: string;
  name: string;
  qualification: string;
  practiceYears?: number;
  experience?: number;
  languages: string[];
  fee: number;
  pricing?: number;
  avatar?: string;
  videoUrl?: string;
}

interface ExpertMatchesProps {
  orderId: string | null;
  matchCriteria: { specialty: string; language: string } | null;
  onBack: () => void;
  onUnlock: (roomId: string) => void;
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function ExpertMatches({ orderId, matchCriteria, onBack, onUnlock }: ExpertMatchesProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState<ToastData>({ show: false, title: "", message: "", type: "info" });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Store the expert user was trying to unlock before they logged in
  const pendingExpertRef = useRef<Expert | null>(null);

  const showToast = (title: string, message: string, type: ToastData["type"]) => {
    setToast({ show: true, title, message, type });
  };

  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

  // 🔐 Fetch current logged-in user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.user) {
          setCurrentUser(res.data.user);
        }
      } catch {
        // Not logged in — currentUser stays null
      }
    }
    fetchUser();
  }, []);

  // 📦 Razorpay SDK Script Injector
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    async function fetchMatchedExperts() {
      if (!orderId && !matchCriteria) {
        setExperts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (orderId) {
          params.set("orderId", orderId);
        } else if (matchCriteria) {
          params.set("specialty", matchCriteria.specialty);
          params.set("language", matchCriteria.language);
        }

        const response = await axios.get(`/api/experts?${params.toString()}`);
        const result = response.data;

        if (result.success) {
          if (result.data && result.data.length > 0) {
            setExperts(result.data);
          } else {
            setExperts([]);
          }
        } else {
          setError(result.error || "Failed to stream matches matrix.");
          setExperts([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Network boundary synchronization failure.");
        setExperts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMatchedExperts();
  }, [orderId, matchCriteria]);

  // Called after user logs in via the modal — triggers payment for pending expert
  const handleModalLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    // Auto-trigger payment for the expert user was trying to unlock
    if (pendingExpertRef.current) {
      const expert = pendingExpertRef.current;
      pendingExpertRef.current = null;
      // Small delay so modal closes smoothly before Razorpay opens
      setTimeout(() => handleUnlockConnect(expert, user), 350);
    }
  };

  const handleUnlockConnect = async (expert: Expert, loggedInUser?: CurrentUser) => {
    if (checkoutLoading) return;

    // Use freshly passed user (from modal login) or state user
    const activeUser = loggedInUser ?? currentUser;

    // 🔐 LOGIN CHECK — toast + modal popup agar login nahi hai
    if (!activeUser) {
      pendingExpertRef.current = expert;
      showToast(
        "Login Required 🔐",
        "Please login to your client account before booking a consultation.",
        "error"
      );
      setShowLoginModal(true);
      return;
    }

    try {
      setCheckoutLoading(true);

      // 1. Order Creation API — real userId aur email bhej rahe hain
      const orderResponse = await axios.post("/api/payment/create-order", {
        orderId,
        userId: activeUser.id,
        email: activeUser.email,
        expertId: expert._id,
        pricing: expert.pricing || expert.fee || 699,
      });

      const orderData = orderResponse.data;
      if (!orderData.success) {
        showToast("Payment Gateway Error", orderData.error || "Failed to initialize payment gateway.", "error");
        setCheckoutLoading(false);
        return;
      }

      // 2. Razorpay Modal Setup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "NaiyeBharat",
        description: "Consultation with Naiye Bharat specialist",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            setLoading(true);

            // 3. Verification API
            const verifyResponse = await axios.post("/api/payment/Verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              localOrderId: orderData.localOrderId,
            });

            const verifyData = verifyResponse.data;
            if (verifyData.success) {
              showToast("Payment Successful 🎉", "Your session is verified. Redirecting to your client panel...", "success");
              // Short delay so user sees the toast, then redirect
              setTimeout(() => {
                window.location.href = "/client";
              }, 1500);
            } else {
              console.error("Verify API returned failure:", verifyData);
              showToast("Verification Failed", verifyData.error || "Transaction could not be verified. Contact support.", "error");
              setLoading(false);
            }
          } catch (verificationError: any) {
            const errMsg =
              verificationError.response?.data?.error ||
              verificationError.message ||
              "Verification failed. Please contact support.";
            console.error("Verification error full details:", verificationError.response?.data || verificationError);
            showToast("Verification Error", errMsg, "error");
            setLoading(false);
          }
        },
        prefill: {
          name: activeUser?.name || "Client User",
          email: activeUser?.email || "user@naiyebharat.com",
        },
        theme: { color: "#00c2a8" },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || "Could not initialize payment gateway.";
      console.error("Payment init error:", err.response?.data || err);
      showToast("Payment Error", errMsg, "error");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050b1d]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parsing Matchmaker Matrices...</p>
      </div>
    );
  }

  return (
    <>
      {/* Global Toast — always on top */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Login Modal — appears when user clicks Unlock Chat without being logged in */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          pendingExpertRef.current = null;
        }}
        onLoginSuccess={handleModalLoginSuccess}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen w-full bg-slate-50 dark:bg-[#050b1d] py-6 px-6 lg:px-12 flex flex-col justify-between">
        <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center">

          {/* BRANDING LOGO COMPONENT */}
          <div className="w-full flex flex-col items-center justify-center text-center pt-2 mb-10 md:mb-14 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-[#00c2a8] flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-[#00c2a8]/10">
                <Scale className="w-4 h-4 text-white dark:text-[#050b1d]" />
              </div>
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-white">
                Naiye<span className="text-amber-600 dark:text-[#00c2a8]">Bharat</span>
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-slate-200/60 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/40 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-[#00c2a8] rounded-full animate-pulse" />
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                Secure Consultation Hub
              </p>
            </div>
          </div>

          {/* Pipeline Control Header Node */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-emerald-600 dark:text-[#00c2a8] uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Automated Matchmaker Pipeline Active
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Smart Matching Results</h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Profiles matched directly from your operational intake packet metrics.</p>
            </div>
            {error || experts.length === 0 ? (
              <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-extrabold border border-rose-100 dark:border-rose-500/20">
                0 Live Verified Nodes Found
              </span>
            ) : (
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-[#00c2a8] px-3 py-1.5 rounded-lg text-[10px] font-extrabold border border-emerald-100 dark:border-emerald-500/20">
                {experts.length} Live Verified Nodes Found
              </span>
            )}
          </div>

          {/* Dynamic EXPERT GRID Canvas Block */}
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            {experts.length > 0 ? experts.map((expert) => {
              const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              const avatarColors = [
                "bg-gradient-to-br from-pink-500 to-rose-600",
                "bg-gradient-to-br from-blue-500 to-indigo-600",
                "bg-gradient-to-br from-emerald-500 to-teal-600",
                "bg-gradient-to-br from-amber-500 to-orange-600",
                "bg-gradient-to-br from-purple-500 to-fuchsia-600",
              ];
              const colorIndex = expert.name.charCodeAt(0) % avatarColors.length;
              const initials = getInitials(expert.name);

              return (
                <motion.div
                  whileHover={{ y: -4, scale: 1.005 }}
                  key={expert._id}
                  onClick={() => setSelectedExpert(expert._id)}
                  className={`w-full bg-white dark:bg-[#0b1329] rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 cursor-pointer select-none
                    border-[2.5px]
                    shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)]
                    dark:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]
                    dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.4)]
                    ${selectedExpert === expert._id
                      ? "border-emerald-500 dark:border-[#00c2a8] ring-2 ring-emerald-500/20 dark:ring-[#00c2a8]/30"
                      : "border-slate-400 dark:border-slate-700/60 hover:border-slate-500 dark:hover:border-slate-600/80"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left flex-grow">
                    <div className="w-20 h-20 sm:w-[72px] sm:h-[72px] rounded-xl bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700/60 shadow-lg p-2 flex-shrink-0 flex items-center justify-center">
                      <LogoSVG />
                    </div>

                    <div className="space-y-2 w-full sm:w-auto">
                      <h3 className="text-xl md:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">Naiye Bharat Specialist</h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00c2a8]" /> {expert.qualification || "Legal Expert"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                        <span className="bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-500/20">
                          🎓 {expert.experience ?? expert.practiceYears ?? 5} Years Exp
                        </span>
                        <span className="bg-slate-200 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 border border-slate-400 dark:border-slate-700/50">
                          <Languages className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {(expert?.language || expert.languages || []).join(", ") || "Hindi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-300 dark:border-slate-800/80 pt-5 md:pt-0 md:pl-6 md:border-l md:border-l-slate-300 dark:md:border-l-slate-800/80">
                    <div className="text-left md:text-right">
                      <span className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-500 tracking-wider uppercase mb-0.5">Consultation Fee</span>
                      <span className="text-xl md:text-2xl font-black text-emerald-600 dark:text-[#00c2a8] tracking-tight">
                        ₹{expert?.pricing || expert.fee || 699} <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">/ session</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockConnect(expert);
                      }}
                      className={`px-5 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] dark:hover:bg-[#00ebd0] text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap ${checkoutLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {checkoutLoading ? "Connecting..." : "Unlock Chat & Connect"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                Waiting for the pipeline to synchronize live advocate data nodes...
              </div>
            )}
          </div>

          {/* Footer Action Navigation */}
          <div className="mt-12 flex items-center justify-start">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none bg-slate-200/50 text-slate-600 border border-slate-300/30 hover:bg-slate-200 hover:text-slate-800 hover:shadow-sm dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back to Intake Form
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
