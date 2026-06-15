"use client";

import { useEffect } from "react";
import gsap from "gsap";

export default function Billing() {


  useEffect(() => {
    gsap.fromTo('.reveal-up', 
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.2 }
    );
  }, []);

  const handleBypass = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Billing system is currently in demo mode. Your consultation request has been logged successfully.");
    window.location.href = "/";
  };

  return (
    <main className="flex-1 bg-white py-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-xs font-bold tracking-[0.4em] text-gold-600 uppercase mb-4">Secured Gateway</h2>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-oxford-900 mb-6">Book Your Consultation</h1>
          <div className="w-24 h-1 bg-gold-500 mx-auto mb-8"></div>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start reveal-up">
          
          {/* Left - Info & Trust */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
              <h3 className="font-bold text-oxford-900 mb-4 uppercase text-xs tracking-widest">Pricing Summary</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-oxford-900">₹999</span>
                <span className="text-slate-500 text-sm">/ session</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed italic">
                The fee includes a 30-minute private consultation with a senior advocate, 
                case assessment, and a clear legal roadmap.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "fas fa-shield-alt", text: "256-bit SSL Encrypted Data" },
                { icon: "fas fa-user-secret", text: "100% Client Privilege" },
                { icon: "fas fa-calendar-check", text: "Instant Scheduling" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  <i className={`${item.icon} text-gold-500 w-5 text-center`}></i>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form Card */}
          <div className="lg:col-span-3">
            <form onSubmit={handleBypass} className="bg-white rounded-[40px] shadow-oxford border border-slate-100 p-10 md:p-12 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-oxford-900 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-gold-500 outline-none transition-all text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-oxford-900 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-gold-500 outline-none transition-all text-sm"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-oxford-900 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-gold-500 outline-none transition-all text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-oxford-900 uppercase tracking-widest">Brief Case Summary</label>
                <textarea 
                  rows={4} 
                  required 
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-gold-500 outline-none transition-all resize-none text-sm"
                  placeholder="Tell us about your legal concern..."
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="group relative w-full py-5 bg-oxford-900 text-gold-400 font-bold border border-gold-500/30 rounded-2xl text-center shadow-lg hover:shadow-gold-500/20 transition-all uppercase tracking-widest text-xs overflow-hidden block"
                >
                  <span className="relative z-10 group-hover:text-oxford-900 transition-colors">Confirm & Pay Securely</span>
                  <div className="absolute inset-0 bg-gold-500 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                </button>
                <p className="mt-4 text-center text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Verified by NaiyeBharat Security</p>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
