// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  LogIn,
  ShieldCheck,
  User,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserData) => void;
}

// ─── Google Button (inline, modal-aware) ─────────────────────────────────────
function ModalGoogleButton({
  onSuccess,
  onError,
}: {
  onSuccess: (user: UserData) => void;
  onError: (msg: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              const res = await axios.post("/api/auth/google", {
                token: response.credential,
              });
              if (res.data.success && res.data.user) {
                onSuccess(res.data.user);
              }
            } catch (err: any) {
              onError(err.response?.data?.error || "Google authentication failed.");
            }
          },
        });

        if (buttonRef.current) {
          google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: buttonRef.current.offsetWidth || 380,
          });
        }
      }
    };

    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      init();
    }
  }, []);

  return (
    <div className="w-full flex justify-center pt-1">
      <div ref={buttonRef} className="w-full min-h-[44px] rounded-xl overflow-hidden" />
    </div>
  );
}

// ─── Login Tab ────────────────────────────────────────────────────────────────
function LoginTab({
  onSuccess,
  onSwitchToSignUp,
}: {
  onSuccess: (user: UserData) => void;
  onSwitchToSignUp: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email.").required("Email is required"),
      password: Yup.string().min(6, "Min 6 characters.").required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setServerError("");
      try {
        const res = await axios.post("/api/auth/login", {
          email: values.email,
          password: values.password,
        });
        if (res.data.success && res.data.user) {
          resetForm();
          onSuccess(res.data.user);
        }
      } catch (err: any) {
        setServerError(err.response?.data?.error || "Invalid credentials.");
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
  });

  return (
    <div className="space-y-4">
      {/* Server Error */}
      {serverError && (
        <div className="p-3 text-xs font-bold bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 rounded-r-xl">
          ⚠️ {serverError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-extrabold ml-1">
            Email
          </label>
          <div
            className={`relative flex items-center group rounded-xl border transition-all ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 ring-2 ring-red-500/10"
                : "border-slate-300 dark:border-slate-700 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]"
            }`}
          >
            <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              autoComplete="off"
              type="email"
              {...formik.getFieldProps("email")}
              placeholder="name@gmail.com"
              className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none font-semibold"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-xs text-red-500 ml-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-extrabold ml-1">
            Password
          </label>
          <div
            className={`relative flex items-center group rounded-xl border transition-all ${
              formik.touched.password && formik.errors.password
                ? "border-red-500 ring-2 ring-red-500/10"
                : "border-slate-300 dark:border-slate-700 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]"
            }`}
          >
            <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              autoComplete="off"
              type={showPassword ? "text" : "password"}
              {...formik.getFieldProps("password")}
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-xs text-red-500 ml-1">{formik.errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid}
            className="w-full py-3 bg-slate-950 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] font-bold rounded-xl shadow-md hover:shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {formik.isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-[#050b1d]/30 dark:border-t-[#050b1d] rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login & Continue
              </>
            )}
          </button>
        </div>
      </form>

      {/* Divider + Google */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700/60" />
        </div>
        <span className="relative px-3 bg-white dark:bg-[#0d1527] text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
          Or continue with
        </span>
      </div>

      <ModalGoogleButton
        onSuccess={onSuccess}
        onError={(msg) => setServerError(msg)}
      />

      {/* Switch to Sign Up */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-amber-600 dark:text-[#00c2a8] font-bold hover:underline cursor-pointer"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

// ─── Sign Up Tab ──────────────────────────────────────────────────────────────
function SignUpTab({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: (user: UserData) => void;
  onSwitchToLogin: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", otp: "" },
    validationSchema: Yup.object({
      name: Yup.string().min(2, "Name too short.").required("Full name is required"),
      email: Yup.string().email("Invalid email.").required("Email is required"),
      password: Yup.string().min(6, "Min 6 characters.").required("Password is required"),
      otp: isOtpStep
        ? Yup.string().length(6, "OTP must be 6 digits.").required("OTP is required")
        : Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      setSuccessMsg("");
      try {
        if (!isOtpStep) {
          // Step 1: request OTP
          const res = await axios.post("/api/auth/signup", {
            action: "get-otp",
            name: values.name,
            email: values.email,
            password: values.password,
          });
          if (res.data.success) {
            setSuccessMsg(res.data.message || "OTP sent to your email.");
            setIsOtpStep(true);
          }
        } else {
          // Step 2: verify OTP
          const verifyRes = await axios.post("/api/auth/signup", {
            action: "verify-otp",
            name: values.name,
            email: values.email,
            password: values.password,
            otp: values.otp,
          });

          if (verifyRes.data.success) {
            // Auto-login after verification
            try {
              const loginRes = await axios.post("/api/auth/login", {
                email: values.email,
                password: values.password,
              });
              if (loginRes.data.success && loginRes.data.user) {
                onSuccess(loginRes.data.user);
              }
            } catch {
              // If auto-login fails, just close — user should try login tab
              setSuccessMsg("Account verified! Please login now.");
              setTimeout(() => onSwitchToLogin(), 1200);
            }
          }
        }
      } catch (err: any) {
        setServerError(err.response?.data?.error || "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
  });

  // Reset OTP step when unmounting (tab switch)
  useEffect(() => {
    return () => {
      setIsOtpStep(false);
      setServerError("");
      setSuccessMsg("");
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {serverError && (
        <div className="p-3 text-xs font-bold bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 rounded-r-xl">
          ⚠️ {serverError}
        </div>
      )}
      {successMsg && (
        <div className="p-3 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-r-xl">
          ✨ {successMsg}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {!isOtpStep ? (
          <>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-extrabold ml-1">
                Full Name
              </label>
              <div
                className={`relative flex items-center group rounded-xl border transition-all ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500 ring-2 ring-red-500/10"
                    : "border-slate-300 dark:border-slate-700 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]"
                }`}
              >
                <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  autoComplete="off"
                  type="text"
                  {...formik.getFieldProps("name")}
                  placeholder="Vivek Sharma"
                  className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none font-semibold"
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-red-500 ml-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-extrabold ml-1">
                Email
              </label>
              <div
                className={`relative flex items-center group rounded-xl border transition-all ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 ring-2 ring-red-500/10"
                    : "border-slate-300 dark:border-slate-700 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]"
                }`}
              >
                <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  autoComplete="off"
                  type="email"
                  {...formik.getFieldProps("email")}
                  placeholder="name@gmail.com"
                  className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none font-semibold"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500 ml-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-extrabold ml-1">
                Password
              </label>
              <div
                className={`relative flex items-center group rounded-xl border transition-all ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 ring-2 ring-red-500/10"
                    : "border-slate-300 dark:border-slate-700 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]"
                }`}
              >
                <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  autoComplete="off"
                  type={showPassword ? "text" : "password"}
                  {...formik.getFieldProps("password")}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500 ml-1">{formik.errors.password}</p>
              )}
            </div>
          </>
        ) : (
          /* OTP Step */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-extrabold ml-1">
                Verification OTP
              </label>
              <div
                className={`relative flex items-center group rounded-xl border transition-all ${
                  formik.touched.otp && formik.errors.otp
                    ? "border-red-500 ring-2 ring-red-500/10"
                    : "border-amber-500 dark:border-[#00c2a8]"
                }`}
              >
                <div className="absolute left-4 text-amber-600 dark:text-[#00c2a8]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={formik.values.otp}
                  onChange={(e) =>
                    formik.setFieldValue("otp", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="6-Digit Code"
                  className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm tracking-[4px] font-bold text-center text-slate-900 dark:text-white outline-none"
                />
              </div>
              {formik.touched.otp && formik.errors.otp && (
                <p className="text-xs text-red-500 ml-1">{formik.errors.otp}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOtpStep(false);
                formik.setFieldValue("otp", "");
              }}
              className="text-[11px] text-slate-500 hover:text-amber-600 dark:hover:text-[#00c2a8] font-bold underline transition-colors cursor-pointer"
            >
              ← Edit details
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          className="w-full py-3 bg-slate-950 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] font-bold rounded-xl shadow-md hover:shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formik.isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-[#050b1d]/30 dark:border-t-[#050b1d] rounded-full animate-spin" />
          ) : isOtpStep ? (
            "Verify & Continue"
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create Account
            </>
          )}
        </button>

        {/* Google — only on first step */}
        {!isOtpStep && (
          <>
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/60" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#0d1527] text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                Or continue with
              </span>
            </div>
            <ModalGoogleButton
              onSuccess={onSuccess}
              onError={(msg) => setServerError(msg)}
            />
          </>
        )}
      </form>

      {/* Switch to Login */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-amber-600 dark:text-[#00c2a8] font-bold hover:underline cursor-pointer"
        >
          Login
        </button>
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const handleClose = () => {
    setActiveTab("login");
    onClose();
  };

  const handleSuccess = (user: UserData) => {
    onLoginSuccess(user);
    setActiveTab("login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-white dark:bg-[#0d1527] rounded-lg shadow-[0_30px_80px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-800/70 overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto scrollbar-premium">

              {/* ── Header ─────────────────────────────────────────── */}
              <div className="sticky top-0 z-10 pt-6 pb-4 px-6 flex items-center justify-between bg-white dark:bg-[#0d1527] border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-[#00c2a8] flex items-center justify-center shadow-md shrink-0">
                    <Scale className="w-4.5 h-4.5 text-white dark:text-[#050b1d]" />
                  </div>
                  <div>
                    <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white block leading-tight">
                      Naiye<span className="text-amber-600 dark:text-[#00c2a8]">Bharat</span>
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Consultation Login
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Info Banner ─────────────────────────────────────── */}
              <div className="mx-6 mt-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
                  Login required to book a consultation and proceed to payment.
                </p>
              </div>

              {/* ── Tabs ────────────────────────────────────────────── */}
              <div className="px-6 mt-4">
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                  {(["login", "signup"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                        activeTab === tab
                          ? "bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab === "login" ? "Login" : "Sign Up"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Tab Content ─────────────────────────────────────── */}
              <div className="px-6 pb-6 pt-4">
                <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                    <motion.div
                      key="login-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <LoginTab
                        onSuccess={handleSuccess}
                        onSwitchToSignUp={() => setActiveTab("signup")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup-tab"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <SignUpTab
                        onSuccess={handleSuccess}
                        onSwitchToLogin={() => setActiveTab("login")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
