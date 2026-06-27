"use client";

import { useState } from "react";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ThemeToggle from "@/app/advocate/components/ThemeToggle";
import Toast, { ToastData } from "@/app/advocate/components/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface ResetPasswordFlowProps {
  onSwitchToLogin: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

type StepType = "email" | "otp" | "password";

export default function ResetPasswordFlow({
  onSwitchToLogin,
  theme,
  onToggleTheme,
}: ResetPasswordFlowProps) {
  const [step, setStep] = useState<StepType>("email");
  const [emailAddress, setEmailAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toast, setToast] = useState<ToastData>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const showToast = (title: string, message: string, type: ToastData["type"]) => {
    setToast({ show: true, title, message, type });
  };

  // 1. Email Step Formik Setup
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email address.")
        .required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const response = await axios.post("/api/auth/reset-password", {
          action: "send-otp",
          email: values.email,
        });

        if (response.data.success) {
          showToast("Success", response.data.message || "OTP code sent successfully!", "success");
          setEmailAddress(values.email);
          setStep("otp");
        }
      } catch (error: any) {
        const msg = error.response?.data?.error || "Error checking email or dispatching verification code.";
        setServerError(msg);
        showToast("Error", msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // 2. OTP Step Formik Setup
  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^[0-9]{6}$/, "Verification code must be exactly 6 digits.")
        .required("Verification code is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const response = await axios.post("/api/auth/reset-password", {
          action: "verify-otp",
          email: emailAddress,
          otp: values.otp,
        });

        if (response.data.success) {
          showToast("Success", "OTP code verified! Please set your new password.", "success");
          setStep("password");
        }
      } catch (error: any) {
        const msg = error.response?.data?.error || "Invalid or expired OTP.";
        setServerError(msg);
        showToast("Error", msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // 3. Password Reset Formik Setup
  const passwordFormik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters.")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match.")
        .required("Confirm new password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const response = await axios.post("/api/auth/reset-password", {
          action: "reset-password",
          email: emailAddress,
          otp: otpFormik.values.otp,
          password: values.password,
        });

        if (response.data.success) {
          showToast("Success! 🎉", "Your password has been successfully updated. Redirecting to login...", "success");
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        }
      } catch (error: any) {
        const msg = error.response?.data?.error || "Failed to reset password. Please request a new OTP.";
        setServerError(msg);
        showToast("Error", msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Toast toast={toast} onClose={() => setToast((t) => ({ ...t, show: false }))} />

      <div className="w-full bg-white dark:bg-[#0d1527] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-slate-300 dark:border-slate-800/70 overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="pt-8 pb-4 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer mr-0.5"
              title="Return to Login"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-11 h-11 rounded-xl bg-slate-950 dark:bg-[#00c2a8] flex items-center justify-center shadow-md shrink-0">
              <KeyRound className="w-5 h-5 text-white dark:text-[#050b1d]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Naiye<span className="text-amber-600 dark:text-[#00c2a8]">Bharat</span>
            </span>
          </div>

          {/* Theme Toggle */}
          <div className="bg-slate-100 dark:bg-[#0a101f] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center px-8 pb-4">
          {step === "email" && "Enter your registered email address to recover your account."}
          {step === "otp" && `We've sent a 6-digit OTP code to ${emailAddress}`}
          {step === "password" && "Configure a new secure password for login accessibility."}
        </p>

        {/* Server Error */}
        {serverError && (
          <div className="mx-8 p-3.5 text-xs font-bold bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 rounded-r-xl">
            {serverError}
          </div>
        )}

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Email Request */}
            {step === "email" && (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={emailFormik.handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      {...emailFormik.getFieldProps("email")}
                      placeholder="e.g. name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 dark:focus:border-[#00c2a8] focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-0 transition duration-200"
                    />
                  </div>
                  {emailFormik.touched.email && emailFormik.errors.email && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{emailFormik.errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={emailFormik.isSubmitting || !emailFormik.isValid}
                  className="w-full py-3 bg-amber-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] hover:bg-amber-700 dark:hover:bg-[#00ebd0] text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {emailFormik.isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                      Dispatching OTP...
                    </>
                  ) : (
                    "Send Verification OTP"
                  )}
                </button>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={otpFormik.handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Verification OTP (6 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    {...otpFormik.getFieldProps("otp")}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl text-center text-md font-mono tracking-[0.4em] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 dark:focus:border-[#00c2a8] focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-0 transition duration-200"
                  />
                  {otpFormik.touched.otp && otpFormik.errors.otp && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 text-center">{otpFormik.errors.otp}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-1/3 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#0a101f] text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpFormik.isSubmitting || !otpFormik.isValid}
                    className="flex-1 py-3 bg-amber-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] hover:bg-amber-700 dark:hover:bg-[#00ebd0] text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {otpFormik.isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Password Configuration */}
            {step === "password" && (
              <motion.form
                key="password-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={passwordFormik.handleSubmit}
                className="space-y-4"
              >
                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    New Secure Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...passwordFormik.getFieldProps("password")}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 dark:focus:border-[#00c2a8] focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-0 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition duration-150 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {passwordFormik.touched.password && passwordFormik.errors.password && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{passwordFormik.errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordFormik.getFieldProps("confirmPassword")}
                      placeholder="Verify secure password entry"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 dark:focus:border-[#00c2a8] focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-0 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition duration-150 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{passwordFormik.errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={passwordFormik.isSubmitting || !passwordFormik.isValid}
                  className="w-full py-3 bg-amber-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] hover:bg-amber-700 dark:hover:bg-[#00ebd0] text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {passwordFormik.isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                      Updating Password security...
                    </>
                  ) : (
                    "Reset Password & Save"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
