"use client";

import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { seededRandom } from "@/utils/random";

export default function Pricing() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('.reveal-up', 
      { autoAlpha: 0, y: 50 },
      { 
        autoAlpha: 1, 
        y: 0, 
        duration: 1.2, 
        stagger: 0.2, 
        ease: "power4.out" ,
        scrollTrigger: {
          trigger: '.reveal-up',
          start: "top 85%"
        }
      }
    );
  }, []);

  return (
    <main className="flex-1 bg-white">
      {/* Premium Hero Banner */}
      <section className="relative hero-gradient py-24 flex items-center justify-center overflow-hidden border-b-8 border-gold-500/10">
        <div className="absolute inset-0 z-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                top: `${seededRandom(i * 3) * 100}%`, 
                left: `${seededRandom(i * 3 + 1) * 100}%`, 
                animationDelay: `${seededRandom(i * 3 + 2) * 10}s` 
              }} 
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="reveal-up">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-tight">
              Transparent <span className="brand-gradient">Pricing</span>
            </h1>
            <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left Column - Intro Material */}
            <div className="lg:sticky lg:top-32 reveal-up">
              <h2 className="text-xs font-bold tracking-[0.4em] text-gold-600 uppercase mb-4">Investment in Justice</h2>
              <h3 className="text-4xl font-serif font-bold text-oxford-900 mb-8">Our Fee Structure</h3>
              <p className="text-slate-600 mb-10 leading-relaxed font-light text-lg">
                We believe in complete financial transparency. Our platform fees are designed to bridge the gap between 
                top-tier legal expertise and those who need it most.
              </p>

              <div className="space-y-6">
                {[
                  { icon: "fas fa-handshake", text: "Integrated Legal & Mental Health Support" },
                  { icon: "fas fa-bolt", text: "Priority Scheduling & Fast Response" },
                  { icon: "fas fa-shield-alt", text: "Secure, Confidential Consultations" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gold-500 shadow-sm">
                      <i className={item.icon}></i>
                    </div>
                    <span className="text-oxford-800 font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Card - Professional Template */}
            <div className="reveal-up bg-white rounded-[40px] shadow-oxford border border-slate-100 p-10 flex flex-col hover:-translate-y-2 transition-all duration-500">
              <div className="text-center mb-10">
                <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full mb-6 inline-block">Standard Access</span>
                <h3 className="text-2xl font-serif font-bold text-oxford-900 mb-4">Quick Consultation</h3>
                <div className="flex items-baseline justify-center mb-8">
                  <span className="text-5xl font-bold text-oxford-900">₹999</span>
                  <span className="text-slate-400 ml-2 font-medium">/ session</span>
                </div>
                <Link href="/billing" className="group relative w-full py-4 bg-oxford-900 text-gold-400 font-bold border border-gold-500/30 rounded-2xl text-center shadow-lg hover:shadow-gold-500/20 transition-all uppercase tracking-widest text-xs overflow-hidden block">
                  <span className="relative z-10 group-hover:text-oxford-900 transition-colors">Book Legal Expert</span>
                  <div className="absolute inset-0 bg-gold-500 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                </Link>
              </div>
              
              <div className="space-y-5 flex-1">
                {[
                  "Expert Advocate Consultation",
                  "30-Minute Targeted Case Review",
                  "Strategic Next-Step Roadmap",
                  "Digital Document Verification",
                  "Fixed Fee - No Hidden Charges"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 p-2">
                    <div className="mt-1 bg-gold-100 text-gold-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] flex-shrink-0">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="text-slate-600 text-[13px] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card - Premium Template */}
            <div className="reveal-up bg-oxford-900 rounded-[40px] shadow-2xl shadow-oxford-900/40 border border-oxford-800 p-10 flex flex-col hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-bl-full -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="text-center mb-10 relative z-10">
                <span className="px-4 py-1.5 bg-gold-500/20 text-gold-400 text-[10px] font-bold uppercase tracking-widest rounded-full mb-6 inline-block">Specialized Care</span>
                <h3 className="text-2xl font-serif font-bold text-white mb-4">Counselling Session</h3>
                <div className="flex items-baseline justify-center mb-8">
                  <span className="text-5xl font-bold text-white">₹999</span>
                  <span className="text-slate-400 ml-2 font-medium">/ session</span>
                </div>
                <Link href="/counselling" className="group relative w-full py-4 bg-gold-500 text-oxford-900 font-bold rounded-2xl text-center shadow-lg hover:shadow-gold-500/40 transition-all uppercase tracking-widest text-xs overflow-hidden block">
                  <span className="relative z-10 group-hover:text-white transition-colors">Start Counselling</span>
                  <div className="absolute inset-0 bg-oxford-800 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                </Link>
              </div>
              
              <div className="space-y-5 flex-1 relative z-10">
                {[
                  "Mental Health & Trauma Support",
                  "Relationship & Family Guidance",
                  "Confidential 1-on-1 Sessions",
                  "Certified Empathetic Counsellors",
                  "Flexible Digital Scheduling",
                  "Anonymous Support Options"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 p-2">
                    <div className="mt-1 bg-white/10 text-gold-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] flex-shrink-0">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="text-slate-300 text-[13px] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Trust Strip */}
          <div className="mt-20 py-10 border-t border-slate-100 text-center reveal-up">
            <p className="text-slate-400 text-sm italic">
              *All platform fees are non-refundable and cover the coordination and first-contact session costs.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
