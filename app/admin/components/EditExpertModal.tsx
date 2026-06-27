"use client";

import React, { useState, useEffect } from "react";
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
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditExpertValidationSchema = Yup.object({
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

  videoUrl: Yup.string().url("Please enter a valid photo URL").nullable().optional(),

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email address is required"),

  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must contain exactly 10 digits")
    .required("Phone number is required"),

  password: Yup.string()
    .min(6, "Password must contain at least 6 characters")
    .optional(),
});

interface EditExpertModalProps {
  isOpen: boolean;
  expert: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditExpertModal({
  isOpen,
  expert,
  onClose,
  onSuccess,
}: EditExpertModalProps) {
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
    initialValues: {
      name: "",
      experience: "",
      specialty: ["Legal Support"],
      language: "",
      pricing: "",
      videoUrl: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
    validationSchema: EditExpertValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!expert) return;
      try {
        const languageArray = values.language
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);

        const response = await fetch(`/api/admin/edit-advocate/${expert._id || expert.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            experience: values.experience,
            specialty: values.specialty,
            language: languageArray,
            pricing: values.pricing,
            videoUrl: values.videoUrl,
            email: values.email,
            phoneNumber: values.phoneNumber,
            password: values.password || undefined, // Send password only if updated
          }),
        });

        if (response.ok) {
          triggerNotification(
            `"${values.name}" successfully updated! 🎉`,
            "success"
          );
          onSuccess();
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          const err = await response.json();
          triggerNotification(
            err.error || "Update validation engine failed",
            "error"
          );
        }
      } catch (error) {
        triggerNotification(
          "Internal Production API latency or network boundary error.",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // Populate values when expert changes
  useEffect(() => {
    if (expert) {
      formik.setValues({
        name: expert.name || "",
        experience: expert.experience !== undefined ? String(expert.experience) : "",
        specialty: Array.isArray(expert.specialty) ? expert.specialty : ["Legal Support"],
        language: Array.isArray(expert.language) ? expert.language.join(", ") : expert.language || "",
        pricing: expert.pricing !== undefined ? String(expert.pricing) : "",
        videoUrl: expert.videoUrl || "",
        email: expert.email || "",
        phoneNumber: expert.phoneNumber || "",
        password: "",
      });
    }
  }, [expert]);

  if (!isOpen || !expert) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden outline-none">
        
        {/* Backdrop Fade Layer */}
        <motion.div
          key="edit-expert-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        />

        {/* Slid-In Drawer Sheet Panel */}
        <motion.div
          key="edit-expert-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 260 }}
          className="relative bg-white dark:bg-[#0b1329] border-l border-slate-300 dark:border-slate-800 h-full max-w-md w-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto scrollbar-premium z-50 transition-colors"
        >
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00c2a8] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Edit Advocate Profile
                </h3>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                  ID: {expert._id || expert.id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121b36] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={formik.handleSubmit} className="space-y-4 flex-1">
            {/* Full Name */}
            <div>
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
            </div>

            {/* Email & Phone Inner Cluster */}
            <div className="grid grid-cols-2 gap-3 bg-emerald-50/20 dark:bg-slate-900/40 p-2.5 rounded-xl border border-emerald-100/40 dark:border-slate-800/60">
              <div>
                <label className="block text-[10px] font-extrabold text-emerald-700 dark:text-[#00c2a8] tracking-wider mb-1">
                  Email
                </label>
                <input
                  autoComplete="off"
                  type="email"
                  {...formik.getFieldProps("email")}
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
                  className="w-full bg-white dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <div className="text-rose-500 text-[9px] mt-0.5 font-semibold">
                    {formik.errors.phoneNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Experience Input */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1">
                Experience (Years)
              </label>
              <input
                autoComplete="off"
                type="number"
                {...formik.getFieldProps("experience")}
                className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
              />
              {formik.touched.experience && formik.errors.experience && (
                <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                  {formik.errors.experience}
                </div>
              )}
            </div>

            {/* Specialty Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
                Core Legal Focus / Specialty (Select multiple)
              </label>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-xl max-h-[140px] overflow-y-auto scrollbar-premium">
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
            </div>

            {/* Languages */}
            <div>
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
            </div>

            {/* Pricing */}
            <div>
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
            </div>

            {/* Photo Link */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider mb-1 flex items-center gap-1.5">
                <Image className="w-3 h-3" />
                Avatar Profile Photo Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps("videoUrl")}
                className="w-full bg-slate-50/50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
              />
              {formik.touched.videoUrl && formik.errors.videoUrl && (
                <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                  {formik.errors.videoUrl}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
              <label className="block text-[10px] font-extrabold text-amber-600 dark:text-[#00c2a8] tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-500 dark:text-[#00c2a8]" />
                Update Access Password (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  autoComplete="off"
                  type={isPasswordVisible ? "text" : "password"}
                  {...formik.getFieldProps("password")}
                  placeholder="Leave empty to keep current password"
                  className="w-full bg-amber-50/10 dark:bg-[#050b1d] border border-amber-200/60 dark:border-slate-800/80 rounded-lg pl-3 pr-10 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-0 transition-all duration-200 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded focus:outline-none"
                >
                  {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-rose-500 text-[10px] mt-0.5 font-semibold">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] dark:hover:bg-[#00ebd0] font-extrabold text-xs tracking-wider py-2.5 rounded-xl transition shadow-md shadow-emerald-600/10 dark:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {formik.isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                  Saving changes...
                </>
              ) : (
                "Save Expert Profile Changes"
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Toast Alert System */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            key="edit-expert-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 z-[99999] max-w-sm min-w-[320px] flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md bg-white/95 text-slate-900 border-slate-200/80 dark:bg-[#0b1329]/95 dark:text-slate-100 dark:border-slate-800"
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
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
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
