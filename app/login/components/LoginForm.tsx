"use client";

import { useState } from "react";
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ThemeToggle from "@/app/advocate/components/ThemeToggle";
import Toast, { ToastData } from "@/app/advocate/components/Toast";
import GoogleButton from "./GoogleButton"; // ← Import kiya

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgot: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function LoginForm({ onSwitchToSignUp, onSwitchToForgot, theme, onToggleTheme }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toast, setToast] = useState<ToastData>({ show: false, title: "", message: "", type: "info" });

  const showToast = (title: string, message: string, type: ToastData["type"]) => {
    setToast({ show: true, title, message, type });
  };

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters.")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const redirectTo = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirectTo") : "";
        const response = await axios.post("/api/auth/login", {
          email: values.email,
          password: values.password,
          redirectTo: redirectTo || undefined,
        });
        if (response.data.success) {
          showToast("Welcome Back! 👋", "Redirecting...", "success");
          setTimeout(() => { window.location.href = response.data.redirect; }, 1000);
        }
      } catch (error: any) {
        const msg = error.response?.data?.error || "Invalid authentication credentials.";
        setServerError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
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
            onClick={() => window.location.href = "/"}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer mr-0.5"
            title="Go to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-slate-950 dark:bg-[#00c2a8] flex items-center justify-center shadow-md shrink-0">
            <Scale className="w-5 h-5 text-white dark:text-[#050b1d]" />
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
        Enter your credentials to access the legal portal.
      </p>

      {/* Server Error */}
      {serverError && (
        <div className="mx-8 p-3.5 text-xs font-bold bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 rounded-r-xl">
          ⚠️ {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="px-8 pb-8 space-y-5 mt-4">

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-400 font-extrabold ml-1">
            Email
          </label>
          <div className={`relative flex items-center group rounded-xl border transition-all ${
            formik.touched.email && formik.errors.email
              ? 'border-red-500 ring-2 ring-red-500/10'
              : 'border-slate-300 dark:border-slate-800 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]'
          }`}>
            <div className="absolute left-4 text-slate-600 dark:text-slate-500 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              autoComplete="off"
              type="email"
              {...formik.getFieldProps("email")}
              placeholder="name@gmail.com"
              className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 outline-none font-semibold"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <div className="text-xs text-red-500 dark:text-red-400 font-medium ml-1 mt-1 animate-fadeIn">
              {formik.errors.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-400 font-extrabold">
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-amber-600 dark:hover:text-[#00c2a8] font-extrabold transition-colors cursor-pointer"
            >
              Forgot?
            </button>
          </div>
          <div className={`relative flex items-center group rounded-xl border transition-all ${
            formik.touched.password && formik.errors.password
              ? 'border-red-500 ring-2 ring-red-500/10'
              : 'border-slate-300 dark:border-slate-800 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]'
          }`}>
            <div className="absolute left-4 text-slate-600 dark:text-slate-500 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              autoComplete="off"
              type={showPassword ? "text" : "password"}
              {...formik.getFieldProps("password")}
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 outline-none font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="text-xs text-red-500 dark:text-red-400 font-medium ml-1 mt-1 animate-fadeIn">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          className="w-full py-4 bg-slate-950 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] font-bold rounded-xl text-center shadow-md hover:shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formik.isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-[#050b1d]/30 dark:border-t-[#050b1d] rounded-full animate-spin" />
          ) : (
            "Login"
          )}
        </button>

        {/* ─── DIVIDER & GOOGLE BUTTON START ─── */}
        <div className="relative flex items-center justify-center my-2 py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-400 dark:border-slate-800/80"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-[#0d1527] text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 font-extrabold transition-colors">
            Or continue with
          </span>
        </div>  

        <GoogleButton 
          theme={theme} 
          showToast={showToast} 
          setServerError={setServerError} 
        />
        {/* ─── DIVIDER & GOOGLE BUTTON END ─── */}

      </form>

      {/* Footer */}
      <div className="p-5 bg-slate-100/50 dark:bg-[#0a101f] border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="text-amber-600 dark:text-[#00c2a8] font-bold hover:underline ml-1 cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
    </>
  );
}