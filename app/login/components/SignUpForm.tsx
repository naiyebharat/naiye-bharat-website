"use client";

import { useState } from "react";
import { Scale, User, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ThemeToggle from "@/app/advocate/components/ThemeToggle";
import Toast, { ToastData } from "@/app/advocate/components/Toast";
import GoogleButton from "./GoogleButton"; // ← Import kiya

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function SignUpForm({ onSwitchToLogin, theme, onToggleTheme }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState<ToastData>({ show: false, title: "", message: "", type: "info" });

  const showToast = (title: string, message: string, type: ToastData["type"]) => {
    setToast({ show: true, title, message, type });
  };

  const signupSchema = Yup.object().shape({
    name: Yup.string().min(2, "Name too short.").required("Full name is required"),
    email: Yup.string().email("Invalid email.").required("Email is required"),
    password: Yup.string().min(6, "Min 6 characters required.").required("Password is required"),
    otp: isOtpStep
      ? Yup.string().length(6, "OTP must be exactly 6 digits.").required("OTP is required")
      : Yup.string(),
    agreedToTerms: Yup.boolean().oneOf([true], "Must accept terms & conditions"),
  });

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", otp: "", agreedToTerms: false },
    validationSchema: signupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      setSuccessMessage("");
      try {
        if (!isOtpStep) {
          const response = await axios.post("/api/auth/signup", {
            action: "get-otp",
            name: values.name,
            email: values.email,
            password: values.password,
          });
          if (response.data.success) {
            setSuccessMessage(response.data.message);
            setIsOtpStep(true);
          }
        } else {
          const verifyResponse = await axios.post("/api/auth/signup", {
            action: "verify-otp",
            name: values.name,
            email: values.email,
            password: values.password,
            otp: values.otp,
          });

          if (verifyResponse.data.success) {
            showToast("Email Verified! 🎉", "Logging you into your dashboard...", "success");

            try {
              const redirectTo = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirectTo") : "";
              const loginResponse = await axios.post("/api/auth/login", {
                email: values.email,
                password: values.password,
                redirectTo: redirectTo || undefined,
              });

              if (loginResponse.data.success) {
                setTimeout(() => { window.location.href = loginResponse.data.redirect; }, 500);
              } else {
                showToast("Almost Done!", "Account verified. Please login now.", "info");
                setTimeout(() => { window.location.href = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`; }, 500);
              }
            } catch {
              showToast("Almost Done!", "Account verified. Please login now.", "info");
              const redirectTo = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirectTo") : "";
              setTimeout(() => { window.location.href = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`; }, 500);
            }
          }
        }
      } catch (error: any) {
        setServerError(error.response?.data?.error || "Something went wrong.");
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
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center px-8 pb-4">
        {isOtpStep ? "Verify Your Email" : "Create Client Account"}
      </h2>

      {/* Notifications */}
      <div className="px-8 space-y-2">
        {serverError && (
          <div className="p-3.5 text-xs font-bold bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 rounded-r-xl">
            ⚠️ {serverError}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-r-xl">
            ✨ {successMessage}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="px-8 pb-8 space-y-5 mt-4">
        {!isOtpStep ? (
          <>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-400 font-extrabold ml-1">
                Full Name
              </label>
              <div className={`relative flex items-center group rounded-xl border transition-all ${
                formik.touched.name && formik.errors.name
                  ? 'border-red-500 ring-2 ring-red-500/10'
                  : 'border-slate-300 dark:border-slate-800 focus-within:border-amber-600 dark:focus-within:border-[#00c2a8]'
              }`}>
                <div className="absolute left-4 text-slate-600 dark:text-slate-500 group-focus-within:text-amber-600 dark:group-focus-within:text-[#00c2a8] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  autoComplete="off"
                  type="text"
                  {...formik.getFieldProps("name")}
                  placeholder="Vivek Sharma"
                  className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 outline-none font-semibold"
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <div className="text-xs text-red-500 dark:text-red-400 font-medium ml-1 mt-1">{formik.errors.name}</div>
              )}
            </div>

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
                <div className="text-xs text-red-500 dark:text-red-400 font-medium ml-1 mt-1">{formik.errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-400 font-extrabold ml-1">
                Password
              </label>
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
                <div className="text-xs text-red-500 dark:text-red-400 font-medium ml-1 mt-1">{formik.errors.password}</div>
              )}
            </div>
          </>
        ) : (
          /* OTP Step */
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-400 font-extrabold ml-1">
              Verification OTP
            </label>
            <div className={`relative flex items-center group rounded-xl border transition-all ${
              formik.touched.otp && formik.errors.otp
                ? 'border-red-500 ring-2 ring-red-500/10'
                : 'border-amber-600 dark:border-[#00c2a8]'
            }`}>
              <div className="absolute left-4 text-amber-600 dark:text-[#00c2a8]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={6}
                value={formik.values.otp}
                onChange={(e) => formik.setFieldValue("otp", e.target.value.replace(/\D/g, ""))}
                placeholder="6-Digit Code"
                className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] text-sm tracking-[4px] font-bold text-center text-slate-900 dark:text-white outline-none"
              />
            </div>
            {formik.touched.otp && formik.errors.otp && (
              <div className="text-xs text-red-500 dark:text-red-400 font-medium ml-1 mt-1">{formik.errors.otp}</div>
            )}
            <button
              type="button"
              onClick={() => setIsOtpStep(false)}
              className="text-[11px] text-slate-500 hover:text-amber-600 dark:hover:text-[#00c2a8] font-bold underline transition-colors block mt-2 ml-1 cursor-pointer"
            >
              ← Edit details
            </button>
          </div>
        )}

        {/* Terms & Conditions Checkbox (Shown only on first step) */}
        {!isOtpStep && (
          <div className="flex items-start gap-2.5 my-4 ml-1">
            <input
              id="signup-terms-checkbox"
              type="checkbox"
              checked={formik.values.agreedToTerms || false}
              onChange={(e) => formik.setFieldValue("agreedToTerms", e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 rounded accent-amber-600 dark:accent-[#00c2a8] cursor-pointer"
            />
            <label htmlFor="signup-terms-checkbox" className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight select-none">
              By continuing, I agree with the{" "}
              <a href="/privacy" className="text-amber-600 dark:text-[#00c2a8] font-bold hover:underline">
                terms & conditions
              </a>
            </label>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid || (!isOtpStep && !formik.values.agreedToTerms)}
          className="w-full py-4 bg-slate-950 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] font-bold rounded-xl text-center shadow-md hover:shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formik.isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-[#050b1d]/30 dark:border-t-[#050b1d] rounded-full animate-spin" />
          ) : (
            isOtpStep ? "Verify Code" : "Request Verification Code"
          )}
        </button>

        {/* ─── DIVIDER & GOOGLE BUTTON ONLY ON FIRST STEP ─── */}
        {!isOtpStep && (
          <>
            <div className="relative flex items-center justify-center my-2 pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800/80"></div>
              </div>
              <span className="relative px-3 bg-white dark:bg-[#0d1527] text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-extrabold transition-colors">
                Or continue with
              </span>
            </div>

            <GoogleButton 
              theme={theme} 
              showToast={showToast} 
              setServerError={setServerError} 
            />
          </>
        )}
        {/* ─── DIVIDER & GOOGLE BUTTON END ─── */}

      </form>

      {/* Footer */}
      <div className="p-5 bg-slate-100/50 dark:bg-[#0a101f] border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-amber-600 dark:text-[#00c2a8] font-bold hover:underline ml-1 cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </div>
    </>
  );
}