"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Image,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 Updated Yup Schema: Removed age, added experience and password validations
const ExpertValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must contain at least 3 characters")
    .required("Expert name is required"),

  experience: Yup.number()
    .typeError("Experience must be a valid number")
    .min(0, "Experience cannot be negative")
    .max(60, "Experience value is too high")
    .required("Years of experience is required"),

  specialty: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one specialization")
    .required("Please select a specialization"),

  language: Yup.string().required("Please specify at least one language"),

  pricing: Yup.number()
    .typeError("Session fee must be a valid number")
    .min(0, "Session fee cannot be negative")
    .required("Session fee is required"),

  videoUrl: Yup.string().url("Please enter a valid photo URL"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email address is required"),

  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must contain exactly 10 digits")
    .required("Phone number is required"),

  password: Yup.string()
    .min(6, "Password must contain at least 6 characters")
    .required("Login password is required"),
});

export default function ExpertForm({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const triggerNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const formik = useFormik({
    // 🔥 Initial Values Synced with our MongoDB Schema Requirements
    initialValues: {
      name: "",
      experience: "",
      specialty: ["Legal Support"], // Kept default context close to active workspace
      language: "",
      pricing: "",
      videoUrl: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
    validationSchema: ExpertValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const languageArray = values.language
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);

        // Submitting directly into the backend synchronization endpoint
        const response = await fetch("/api/admin/add-advocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            experience: values.experience, // 🔥 Experience passing instead of age
            specialty: values.specialty,
            language: languageArray,
            pricing: values.pricing,
            videoUrl: values.videoUrl,
            email: values.email,
            phoneNumber: values.phoneNumber,
            password: values.password, // 🔥 Secure login credentials shared by admin
          }),
        });

        if (response.ok) {
          triggerNotification(
            `"${values.name}" successfully onboarded into platform network! 🎉`,
            "success",
          );
          resetForm();
          onSuccess();
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          const err = await response.json();
          triggerNotification(
            err.error || "Submission layer validation engine failed",
            "error",
          );
        }
      } catch (error) {
        triggerNotification(
          "Internal Production API latency or network boundary error.",
          "error",
        );
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#0b1329] border border-slate-400 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto scrollbar-premium transition-all relative"
      >
        {/* Header Block: Added strong isolation layers & elevated stacking index */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 sticky top-[-24px] mx-[-24px] px-[24px] pt-[24px] bg-white dark:bg-[#0b1329] z-20 shadow-sm shadow-slate-100/50 dark:shadow-none">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-[#00c2a8] text-xl font-bold">
              👤+
            </span>
            <h2 className="text-md font-bold text-slate-800 dark:text-white">
              Onboard New Advocate
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Form Container with isolated baseline layout execution */}
        <form onSubmit={formik.handleSubmit} className="space-y-3 relative z-0">
          {/* Full Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1">
              Advocate Full Name
            </label>
            <input
              autoComplete="off"
              type="text"
              {...formik.getFieldProps("name")}
              className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {formik.errors.name}
              </div>
            )}
          </motion.div>

          {/* Email & Phone Inner Cluster */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3 bg-emerald-50/20 dark:bg-slate-900/40 p-2.5 rounded-xl border border-emerald-100/40 dark:border-slate-800/60"
          >
            <div>
              <label className="block text-[10px] font-extrabold text-emerald-700 dark:text-[#00c2a8] tracking-wider mb-1">
                Email
              </label>
              <input
                autoComplete="off"
                type="email"
                {...formik.getFieldProps("email")}
                placeholder="counsel@naiyebharat.com"
                className="w-full bg-white dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-rose-500 text-[9px] mt-0.5 font-semibold">
                  {formik.errors.email}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-emerald-700 dark:text-[#00c2a8] tracking-wider mb-1">
                Phone
              </label>
              <input
                autoComplete="off"
                type="text"
                {...formik.getFieldProps("phoneNumber")}
                maxLength={10}
                placeholder="10 Digits"
                className="w-full bg-white dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <div className="text-rose-500 text-[9px] mt-0.5 font-semibold">
                  {formik.errors.phoneNumber}
                </div>
              )}
            </div>
          </motion.div>

          {/* Experience Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1">
              Experience (Years)
            </label>
            <input
              autoComplete="off"
              type="number"
              {...formik.getFieldProps("experience")}
              placeholder="e.g. 5"
              className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
            />
            {formik.touched.experience && formik.errors.experience && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {formik.errors.experience}
              </div>
            )}
          </motion.div>

          {/* Specialty Selector (Interactive Badges) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="space-y-1.5"
          >
            <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
              Core Legal Focus / Specialty (Select multiple)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-xl">
              {[
                "Civil",
                "Criminal",
                "Family Law",
                "Corporate Law",
                "Property Dispute",
                "Court Marriage",
                "Pre-Legal Counselling",
                "Post Legal Counselling",
                "Adult Counselling",
                "Teen Counselling",
                "Victims Support"
              ].map((spec) => {
                const isSelected = formik.values.specialty.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      const currentSelected = [...formik.values.specialty];
                      if (isSelected) {
                        formik.setFieldValue(
                          "specialty",
                          currentSelected.filter((s) => s !== spec)
                        );
                      } else {
                        formik.setFieldValue("specialty", [
                          ...currentSelected,
                          spec
                        ]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white dark:bg-[#00c2a8] dark:border-[#00c2a8] dark:text-[#050b1d] shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-[#0b1329] dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
            {formik.touched.specialty && formik.errors.specialty && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {typeof formik.errors.specialty === "string"
                  ? formik.errors.specialty
                  : "Please select at least one specialty"}
              </div>
            )}
          </motion.div>

          {/* Languages */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1">
              Languages Offered
            </label>
            <input
              autoComplete="off"
              type="text"
              {...formik.getFieldProps("language")}
              placeholder="English, Hindi, Punjabi"
              className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
            />
            {formik.touched.language && formik.errors.language && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {formik.errors.language}
              </div>
            )}
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1">
              Consultation Fee (₹ Amount)
            </label>
            <input
              autoComplete="off"
              type="number"
              {...formik.getFieldProps("pricing")}
              className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
            />
            {formik.touched.pricing && formik.errors.pricing && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {formik.errors.pricing}
              </div>
            )}
          </motion.div>

          {/* Photo Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1 flex items-center gap-1.5">
              <Image className="w-3 h-3" />
              Avatar Profile Photo Link
            </label>
            <input
              type="url"
              {...formik.getFieldProps("videoUrl")}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
            />
            {formik.touched.videoUrl && formik.errors.videoUrl && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {formik.errors.videoUrl}
              </div>
            )}
          </motion.div>

          {/* 🔥 Assign Password Field with Eye Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3"
          >
            <label className="block text-[10px] font-extrabold text-amber-600 dark:text-[#00c2a8] tracking-wider mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-500 dark:text-[#00c2a8]" />
              Assign Access Password
            </label>

            {/* Relative wrapper for positioning the eye icon */}
            <div className="relative flex items-center">
              <input
                autoComplete="off"
                type={isPasswordVisible ? "text" : "password"}
                {...formik.getFieldProps("password")}
                placeholder="e.g. Pass@1234 (Min 6 Characters)"
                className="w-full bg-amber-50/10 dark:bg-[#050b1d] border border-amber-200/60 dark:border-slate-800/80 rounded-lg pl-3 pr-10 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-0 transition-all duration-200 font-mono"
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded focus:outline-none"
              >
                {isPasswordVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {formik.touched.password && formik.errors.password && (
              <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                {formik.errors.password}
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] dark:hover:bg-[#00ebd0] font-extrabold text-xs tracking-wider py-2.5 rounded-xl transition shadow-md shadow-emerald-600/10 dark:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {formik.isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                Encrypting & Onboarding...
              </>
            ) : (
              "Verify & Onboard Advocate Node"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Toast Alert System */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 z-50 max-w-sm min-w-[320px] flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md bg-white/95 text-slate-900 border-slate-200/80 dark:bg-[#0b1329]/95 dark:text-slate-100 dark:border-slate-800"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-[#00c2a8] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            )}

            <div className="flex-1 text-[11px] font-semibold leading-relaxed">
              {notification.message}
            </div>

            <button
              type="button"
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
