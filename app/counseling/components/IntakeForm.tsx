"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Sun, Moon, Sparkles } from "lucide-react";
// import Image from "next/image";  // Commented: PNG files are corrupt, fix images before uncommenting

// import step1 from "@/assets/step_1.png";
// import step2 from "@/assets/step_2.png";
// import step3 from "@/assets/step_3.png";

const ClientIntakeSchema = Yup.object({
  clientName: Yup.string().min(3, "Name must contain at least 3 characters").required("Your full name is required"),
  clientAge: Yup.number().typeError("Age must be a valid number").min(12, "Age must be greater than 12").required("Age context is required").max(80, "Age must be lesser than 80"),
  email: Yup.string().email("Please enter a valid email address").required("Email address is required"),
  phoneNumber: Yup.string().matches(/^[0-9]{10}$/, "Phone number must contain exactly 10 digits").required("Phone number is required"),
  specialty: Yup.string().required("Please select a core domain specialty"),
  language: Yup.string().required("Please select your comfortable language"),
  issueDescription: Yup.string().min(10, "Please describe your concern in at least 10 characters").required("Description layer requires context metrics"),
});

const LOCAL_STORAGE_KEY = "counseling_intake_form_state";

// const STEPS = [
//   { img: step1, label: "Tell us your problem" },
//   { img: step2, label: "Get suitable advocate" },
//   { img: step3, label: "Secure Transaction" },
// ];

export default function IntakeForm({ onSuccess }: { onSuccess: (orderId: string | null, matchCriteria: { specialty: string; language: string }) => void }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoaded, setIsLoaded] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const [initialValues, setInitialValues] = useState({
    clientName: "",
    clientAge: "",
    email: "",
    phoneNumber: "",
    specialty: "Mental Health / Therapy",
    language: "English",
    issueDescription: "",
  });

  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setInitialValues(prev => ({
              ...prev,
              email: data.user.email,
              clientName: prev.clientName || data.user.name || ""
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching user session in intake form:", err);
      }
    }

    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        setInitialValues(JSON.parse(savedData));
      } catch (e) {
        console.error(e);
      }
    }

    fetchUser().then(() => {
      setIsLoaded(true);
    });

    if (document.documentElement.classList.contains("dark")) setTheme("dark");
  }, []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: ClientIntakeSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await fetch("/api/counseling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          onSuccess(data.orderId ?? null, data.matchCriteria ?? { specialty: values.specialty, language: values.language });
        } else {
          setToast({ show: true, message: data.error || "Ingestion fail.", type: "error" });
        }
      } catch {
        setToast({ show: true, message: "Network boundary failure.", type: "error" });
      } finally { setSubmitting(false); }
    },
    validateOnMount: true
  });

  useEffect(() => {
    if (isLoaded) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formik.values));
  }, [formik.values, isLoaded]);

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 dark:bg-[#050b1d]" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-slate-50 dark:bg-[#050b1d] transition-colors duration-300 py-8 px-6 lg:px-12 relative"
    >
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-6 p-3 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-slate-700 dark:text-slate-200 cursor-pointer"
      >
        {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#00c2a8]" />}
      </button>

      <div className="w-full max-w-5xl mx-auto">

        {/* ── Heading ── */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600 dark:text-[#00c2a8]" />
            Smart Consultation Matchmaker
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 tracking-wide max-w-2xl mx-auto">
            Please input your query securely. Our systems will dynamically extract pricing levels, verified credentials, and real expert domain profiles.
          </p>
        </div>

        {/* ── Three Step Images (temporarily removed — PNG files corrupt, fix later) ── */}

        {/* ── Progress Tracker ── */}
        <div className="flex items-center justify-between max-w-3xl mx-auto w-full mb-8 text-xs font-bold text-slate-700 dark:text-slate-500 px-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00c2a8]">
            <span className="w-6 h-6 bg-emerald-100 dark:bg-[#00c2a8]/10 text-emerald-700 dark:text-[#00c2a8] rounded-full flex items-center justify-center text-[11px]">1</span>
            Intake Form
          </div>
          <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[11px]">2</span>
            Match Profile
          </div>
          <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[11px]">3</span>
            Secure Room
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="w-full bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl">
          <form onSubmit={formik.handleSubmit} className="space-y-6">

            {/* Row 1: Name + Age */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                <input
                  autoComplete="off"
                  type="text"
                  {...formik.getFieldProps("clientName")}
                  placeholder="e.g. Shiva"
                  disabled={!!currentUser}
                  className={`w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-medium ${currentUser ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {formik.touched.clientName && formik.errors.clientName && (
                  <div className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formik.errors.clientName}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Your Age</label>
                <input
                  autoComplete="off"
                  type="number"
                  {...formik.getFieldProps("clientAge")}
                  placeholder="e.g. 28"
                  className="w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-medium"
                />
                {formik.touched.clientAge && formik.errors.clientAge && (
                  <div className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formik.errors.clientAge}</div>
                )}
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
                <input
                  autoComplete="off"
                  type="email"
                  {...formik.getFieldProps("email")}
                  placeholder="shiva@domain.com"
                  disabled={!!currentUser}
                  className={`w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-medium ${currentUser ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formik.errors.email}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                <input
                  autoComplete="off"
                  type="text"
                  {...formik.getFieldProps("phoneNumber")}
                  maxLength={10}
                  placeholder="10 digit mobile code"
                  className="w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-medium"
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <div className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formik.errors.phoneNumber}</div>
                )}
              </div>
            </div>

            {/* Row 3: Specialty + Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Core Specialty</label>
                <select
                  {...formik.getFieldProps("specialty")}
                  className="w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-bold"
                >
                  <option value="civil">Civil</option>
                  <option value="criminal">Criminal</option>
                  <option value="family_law">Family Law</option>
                  <option value="corporate_law">Corporate Law</option>
                  <option value="property_dispute">Property Dispute</option>
                  <option value="court_marriage">Court Marriage</option>
                  <option value="pre_legal_counselling">Pre-Legal Counselling</option>
                  <option value="post_legal_counselling">Post Legal Counselling</option>
                  <option value="adult_counselling">Adult Counselling</option>
                  <option value="teen_counselling">Teen Counselling</option>
                  <option value="victims_support">Victims Support</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Comfortable Language</label>
                <select
                  {...formik.getFieldProps("language")}
                  className="w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-bold"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Malayalam">Malayalam</option>
                </select>
              </div>
            </div>

            {/* Row 4: Issue Description */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Describe Your Issue (Confidential)</label>
              <textarea
                autoComplete="off"
                {...formik.getFieldProps("issueDescription")}
                rows={5}
                placeholder="Provide a summary of your concern..."
                className="w-full bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition-all font-medium resize-none leading-relaxed"
              />
              {formik.touched.issueDescription && formik.errors.issueDescription && (
                <div className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formik.errors.issueDescription}</div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {!currentUser && (
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3">
                    You can view expert matches now. Login is only required when you book a consultation.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                  className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] dark:hover:bg-[#00ebd0] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {formik.isSubmitting ? "Processing..." : "Find Matching Experts & Profiles →"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50 min-w-[320px] flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md bg-white/95 text-slate-900 border-slate-200 dark:bg-[#0b1329]/95 dark:text-slate-100 dark:border-slate-800 animate-slideUp">
          {toast.type === "success"
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#00c2a8]" />
            : <AlertCircle className="w-5 h-5 text-rose-600" />
          }
          <div className="flex-1 text-xs font-semibold">{toast.message}</div>
          <button type="button" onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}