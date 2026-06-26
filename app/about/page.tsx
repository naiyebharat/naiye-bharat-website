// @ts-nocheck
"use client";

import React from "react";
import { 
  Shield, 
  HeartHandshake, 
  Zap, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  CreditCard, 
  UserCheck,
  Scale
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutUsPage() {
  return (
    // Outer container styled strictly with a clean, modern Light Theme background & text
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-800 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* ── HERO SECTION ── */}
        <section className="text-center space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-extrabold uppercase tracking-widest"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Empowering Citizens</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight uppercase"
          >
            Naiye Bharat: Legal Support <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Redefined & Democratic
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
          >
            We are building the future of accessibility, digital justice, and wellness in India. 
            Naiye Bharat bridges the gap by connecting you instantly with top-tier legal advocates 
            and qualified counselors in your hour of need.
          </motion.p>
        </section>

        {/* ── CORE SERVICES ── */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Our Core Services</h2>
            <div className="w-12 h-1 bg-emerald-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Legal Consultation */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Legal Consultation</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Connect with verified advocates specializing in Civil, Criminal, Family, Corporate, and Property Law. Secure chat rooms and phone calls keep your interactions completely private and professional.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Mental Health Counseling */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-650 shadow-sm">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Mental Health</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Confidential support for Teenagers, Adults, and Victims. Our certified and empathetic counselors assist you through life's complex transitions, stress, and anxiety in a zero-judgment environment.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Emergency SOS Support */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-red-50/50 border border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-red-100/60 border border-red-200 flex items-center justify-center text-red-600 shadow-sm animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Emergency SOS</h3>
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest">Live</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  When you are in immediate legal distress, click the SOS button. A verified local advocate is matched and will connect with you in **approximately 45 minutes** to guide and protect you through critical situations.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── BOOKING WORKFLOW ── */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">How To Book A Consultation</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">A simple, transparent 3-step process</p>
            <div className="w-12 h-1 bg-emerald-600 mx-auto rounded-full" />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4"
            >
              <span className="absolute -top-3 left-6 bg-slate-900 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md">Step 01</span>
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">Explain Your Problem</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Fill out our quick, intuitive intake form. Specify your category, choose your preferred language, and write a summary of your legal or counseling needs.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4"
            >
              <span className="absolute -top-3 left-6 bg-slate-900 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md">Step 02</span>
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">Pay Consultation Fee</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Pay the transparent and flat-rate consultation fee securely via integrated payment options. No hidden charges or extra middleman fees.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4"
            >
              <span className="absolute -top-3 left-6 bg-emerald-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md">Step 03</span>
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">Get Matched Instantly</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Our smart matchmaking engine assigns a qualified, verified advocate. A secure room is unlocked for you to chat and seek resolution immediately.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── MISSION STATEMENT ── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="space-y-4 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded">Our Vision</span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Bringing transparency to legal aid</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
              Legal support should not be difficult, confusing, or unreasonably delayed. 
              By leveraging advanced matchmaking technology, strict advocate verification, 
              and robust real-time response parameters, Naiye Bharat brings direct, prompt, 
              and reliable counsel to every Indian citizen.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/counseling"}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all transform active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <span>Consult Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>

        {/* ── SECURITY TRUST BADGES ── */}
        <section className="border-t border-slate-200 pt-8 flex flex-wrap justify-center sm:justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            <span>100% Verified Legal Advocates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            <span>Secure SSL Encrypted Chats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            <span>Zero Data Leak Guarantee</span>
          </div>
        </section>

      </div>
    </div>
  );
}