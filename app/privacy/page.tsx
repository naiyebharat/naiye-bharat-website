// @ts-nocheck
"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  HelpCircle, 
  ChevronDown,
  Mail,
  Phone,
  MapPinned,
  Lock,
  FileLock2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PrivacyPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      q: "What is Naiye Bharat?",
      a: "Naiye Bharat is an on-demand legal matchmaking and mental health counseling platform. We connect citizens instantly with verified advocates for legal consultations and certified professionals for counseling support."
    },
    {
      q: "Who can use Naiye Bharat?",
      a: "Any citizen seeking legal advice, documentation guidance, mental health counseling, or emergency legal protection can use our platform."
    },
    {
      q: "How & why is my data used?",
      a: "We collect your Name and Email to secure your profile and authenticate your dashboard. During an emergency SOS trigger, we temporarily access your real-time Location so that our matched advocates can safely navigate and arrive at your location to support you."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. All user records, chat rooms, and intake data are encrypted end-to-end. We employ a zero-leak database architecture ensuring your case history is strictly accessible only to you and your matched professional."
    },
    {
      q: "How to book a consultation?",
      a: "Go to our services page, select a core specialty, fill out the detailed intake form explaining your concern, pay the transparent flat consultation fee online, and our engine will instantly match you with a verified expert to open a secure chat room."
    },
    {
      q: "How to book/trigger SOS?",
      a: "If you are in immediate legal danger or crisis, tap the 'Emergency SOS' button on your client panel. Our system will immediately ping nearby advocates, match you, and dispatch help to your location."
    },
    {
      q: "Who is eligible to book SOS & Consultation?",
      a: "To book a consultation or trigger the emergency SOS service, users must be at least 18 years of age. By using the platform, you confirm you meet this minimum age requirement."
    },
    {
      q: "Does booking a consultation guarantee that I will win my case?",
      a: "No. Booking a consultation through Naiye Bharat provides access to professional legal advice, case analysis, and representation support, but does not guarantee a successful case outcome. Legal proceedings depend on evidence, facts, and judicial discretion. Our matched advocates will work with absolute integrity and try their best to represent you, but we do not guarantee wins or defend unlawful actions."
    },
    {
      q: "How do I contact support?",
      a: (
        <div className="space-y-3">
          <p>Our dedicated support desk is available to assist you with payments, disputes, or account issues:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Mail className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Email Support</p>
                <a href="mailto:naiyebharat@gmail.com" className="text-slate-800 hover:text-emerald-600">naiyebharat@gmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Call Helpline</p>
                <a href="tel:+918512005097" className="text-slate-800 hover:text-emerald-600">+91 85120 05097</a>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-1 md:col-span-3">
              <MapPinned className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Incubation Head Office</p>
                <p className="text-slate-700 font-medium">Dronacharya group of institutions, B-27, Knowledge Park-III, incubation center, Greater Noida, Uttar Pradesh</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-800 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* ── HEADER ── */}
        <section className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Data Infrastructure</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase"
          >
            Privacy & Platform Policies
          </motion.h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Last Updated: June 2026 • Version 2.6 Core Compliance
          </p>
          <div className="w-12 h-1 bg-emerald-600 mx-auto rounded-full mt-3" />
        </section>

        {/* ── DATA COLLECTION SUMMARY ── */}
        <section className="space-y-6">
          <div className="border-l-4 border-emerald-500 pl-3">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">How & Why We Collect Data</h2>
            <p className="text-xs text-slate-550 font-semibold mt-0.5">Understanding transparency layers of Naiye Bharat</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Email & Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Account Credentials</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Email, Name, Phone Number</p>
                </div>
              </div>
              <p className="text-slate-650 text-xs leading-relaxed">
                Collected during registration to initialize profiles, facilitate secure login portals, and provide direct booking notifications, receipts, and order updates to client directories.
              </p>
            </motion.div>

            {/* Card 2: SOS Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Real-time Location</h3>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Used strictly for SOS dispatch</p>
                </div>
              </div>
              <p className="text-slate-650 text-xs leading-relaxed">
                When you trigger an emergency SOS, we request location permissions. This is processed solely to match nearby advocates and guide them to your exact location in approximately 45 minutes.
              </p>
            </motion.div>
          </div>

          {/* Third party warning/assurance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#fafbfd] border border-slate-200 rounded-2xl p-5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 flex-shrink-0">
              <FileLock2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Third-Party Protection Guarantee</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                We believe in absolute user confidentiality. Your logs, personal info, location history, and case summaries are protected using modern database encryption standards and are **never** sold, traded, or shared with third-party advertising companies.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── FAQ SECTION ── */}
        <section className="space-y-6">
          <div className="border-l-4 border-emerald-500 pl-3">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-550 font-semibold mt-0.5">Find answers to security and functionality questions</p>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">{faq.q}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── SECURITY TRUST BADGES ── */}
        <section className="border-t border-slate-200 pt-8 flex flex-wrap justify-center sm:justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            <span>Naiye Bharat Encryption Verified</span>
          </div>
          <span>Compliance Protocol Secure</span>
        </section>

      </div>
    </div>
  );
}
