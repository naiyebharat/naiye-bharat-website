"use client";

import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";

export default function Emergency() {
  useEffect(() => {
    gsap.fromTo('.emergency-anim', 
      { opacity: 0, scale: 0.9, y: 50 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        duration: 1.2, 
        stagger: 0.2, 
        ease: "power4.out" 
      }
    );
  }, []);

  return (
    <main className="flex-1 hero-gradient flex items-center justify-center py-10 sm:py-20 px-4 sm:px-6 min-h-screen relative overflow-hidden">
      {/* Background Warning Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grid grid-cols-6 gap-0">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="border border-white h-full"></div>
        ))}
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="bg-white rounded-[30px] sm:rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden emergency-anim">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Pillar - Warning & Info */}
            <div className="lg:w-[40%] bg-red-600 p-8 sm:p-12 text-white flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 sm:mb-10 border border-white/30 animate-pulse">
                  <i className="fas fa-exclamation-triangle text-2xl sm:text-3xl"></i>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold uppercase tracking-widest leading-tight mb-4 sm:mb-6">
                  Critical <br className="hidden sm:block"/> Response
                </h1>
                <p className="text-red-100 font-light leading-relaxed">
                  Immediate legal intervention for arrests, raids, or urgent police matters. 
                  Our senior strategists are on standby 24/7.
                </p>
              </div>

              <div className="mt-8 sm:mt-20 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  Active Control Room
                </div>
              </div>
            </div>

            {/* Right Pillar - Action Center */}
            <div className="lg:w-[60%] p-8 sm:p-12 md:p-16 space-y-8 sm:space-y-12">
              <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
                <h2 className="text-[10px] font-bold tracking-[0.4em] text-red-600 uppercase">Action Protocol</h2>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-oxford-900 leading-tight">
                  Contact Our Senior Emergency Strategist
                </h3>
              </div>

              <div className="grid gap-6">
                <a href="tel:+918512005097" className="group relative block w-full bg-red-600 py-5 sm:py-7 rounded-2xl sm:rounded-3xl shadow-xl transition-all hover:bg-black active:scale-95 overflow-hidden">
                   <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 text-white">
                     <i className="fas fa-phone text-2xl sm:text-3xl"></i>
                     <div className="text-left">
                        <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60">Primary SOS Line</div>
                        <div className="text-xl sm:text-3xl font-bold tracking-tight">Call Mobile SOS</div>
                     </div>
                   </div>
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 group-hover:bg-white/40 transition-colors"></div>
                </a>

                <a href="https://wa.me/918512005097?text=EMERGENCY%20LEGAL%20HELP" className="group relative block w-full bg-slate-50 border border-slate-100 py-5 sm:py-6 rounded-2xl sm:rounded-3xl transition-all hover:border-green-600 active:scale-95 overflow-hidden">
                   <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 text-oxford-900">
                     <i className="fab fa-whatsapp text-2xl sm:text-3xl text-green-600"></i>
                     <div className="text-left">
                        <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-40">Digital SOS Portal</div>
                        <div className="text-sm sm:text-xl font-bold uppercase tracking-widest">WhatsApp SOS Help</div>
                     </div>
                   </div>
                </a>
              </div>

              <div className="pt-8 sm:pt-10 border-t border-slate-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-6 text-center md:text-left">
                   <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                      <i className="fas fa-shield-halved text-red-600"></i>
                      Strictly Privileged Communication
                   </div>
                   <Link href="/" className="text-slate-500 hover:text-red-700 font-bold uppercase tracking-widest text-[10px] sm:text-[11px] flex items-center gap-2 transition-all">
                     <i className="fas fa-arrow-left"></i> Abort & Return Home
                   </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <p className="text-center mt-12 text-white/40 text-[10px] uppercase tracking-[0.5em] font-bold reveal-up">
           Authorized Legal Defense Network &bull; NaiyeBharat
        </p>
      </div>
    </main>
  );
}
