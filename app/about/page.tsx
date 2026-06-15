"use client";

import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { seededRandom } from "@/utils/random";

export default function About() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fade Up Animation
    gsap.utils.toArray<HTMLElement>('.reveal-up').forEach(element => {
      gsap.fromTo(element, 
        { autoAlpha: 0, y: 40 }, 
        {
          autoAlpha: 1, 
          y: 0, 
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Staggered Entrance
    gsap.utils.toArray<HTMLElement>('.stagger-parent').forEach(parent => {
      gsap.fromTo(parent.children, 
        { autoAlpha: 0, y: 30 },
        { 
          autoAlpha: 1, 
          y: 0, 
          duration: 1, 
          stagger: 0.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: parent,
            start: "top 85%"
          }
        }
      );
    });
  }, []);

  return (
    <main className="flex-1 bg-white">
      {/* Premium Hero Section */}
      <section className="relative hero-gradient py-32 flex items-center justify-center overflow-hidden border-b-8 border-gold-500/10">
        <div className="absolute inset-0 z-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                top: `${seededRandom(i * 5) * 100}%`, 
                left: `${seededRandom(i * 5 + 1) * 100}%`, 
                animationDelay: `${seededRandom(i * 5 + 2) * 15}s`, 
                width: `${seededRandom(i * 5 + 3) * 4 + 1}px`, 
                height: `${seededRandom(i * 5 + 4) * 4 + 1}px` 
              }} 
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="reveal-up mb-8">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white mb-6">
              Our Legacy of <span className="brand-gradient">Justice</span>
            </h1>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-8"></div>
          </div>
          <p className="reveal-up text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
            Leading the way in legal excellence for over two decades with integrity, dedication, and strategic precision.
          </p>
        </div>
      </section>

      {/* Stats Section - Premium Overlay */}
      <section className="relative z-20 -mt-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Years of Excellence", val: "20+" },
            { label: "Successful Cases", val: "15k+" },
            { label: "Expert Advocates", val: "25+" },
            { label: "Client Satisfaction", val: "99%" }
          ].map((stat, i) => (
            <div key={i} className="reveal-up bg-white rounded-3xl p-8 shadow-oxford border border-slate-100 text-center transform hover:-translate-y-2 transition-all">
              <div className="text-4xl font-serif font-bold text-oxford-900 mb-2">{stat.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gold-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Narrative */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="reveal-up space-y-10">
              <div className="space-y-4">
                <h2 className="text-xs font-bold tracking-[0.4em] text-gold-600 uppercase">The Foundation</h2>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-oxford-900">Who We Are</h3>
              </div>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-light">
                <p>
                  Founded on the principles of integrity and expertise, NaiyeBharat has grown into a beacon of legal trust in India. 
                  Based in the prestigious Saket District Court, we serve a diverse clientele with a focus on results and ethical transparency.
                </p>
                <div className="p-10 bg-oxford-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full pointer-events-none"></div>
                   <p className="text-white font-serif italic text-xl relative z-10">
                     &quot;Justice should be accessible, transparent, and firm. We approach every case as a mission of trust.&quot;
                   </p>
                   <p className="text-gold-500 font-bold uppercase tracking-widest text-[10px] mt-6 relative z-10">&mdash; The Founder&apos;s Vision</p>
                </div>
              </div>
            </div>

            <div className="reveal-up grid grid-cols-2 gap-6">
               <div className="space-y-6">
                  <div className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 overflow-hidden shadow-xl">
                     <Image 
                       src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" 
                       width={400} 
                       height={533} 
                       className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                       alt="court" 
                     />
                  </div>
                  <div className="aspect-square rounded-[2.5rem] bg-gold-500 flex items-center justify-center p-10 text-white shadow-gold hover:scale-105 transition-all">
                     <i className="fas fa-balance-scale text-6xl"></i>
                  </div>
               </div>
               <div className="space-y-6 mt-12">
                  <div className="aspect-square rounded-[2.5rem] bg-oxford-800 flex items-center justify-center p-10 text-gold-500 shadow-xl">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">24/7</div>
                        <div className="text-[10px] uppercase tracking-widest">Emergency Support</div>
                      </div>
                  </div>
                  <div className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 overflow-hidden shadow-xl">
                     <Image 
                       src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800" 
                       width={400} 
                       height={533} 
                       className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                       alt="law" 
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Modern Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 reveal-up">
            <h2 className="text-xs font-bold tracking-[0.4em] text-gold-600 uppercase mb-4">Our DNA</h2>
            <h3 className="text-4xl font-serif font-bold text-oxford-900">Core Philosophies</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-parent">
            {[
              { title: "Integrity", desc: "Absolute honesty in every proceeding.", icon: "fa-shield-halved" },
              { title: "Strategy", desc: "Surgical legal planning for every case.", icon: "fa-chess-knight" },
              { title: "Empathy", desc: "Prioritizing your emotional well-being.", icon: "fa-heart-pulse" },
              { title: "Clarity", desc: "Transparent communication, always.", icon: "fa-eye" }
            ].map((val, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-gold-600 mb-8 group-hover:bg-gold-500 group-hover:text-white transition-all">
                  <i className={`fas ${val.icon} text-2xl`}></i>
                </div>
                <h4 className="text-xl font-bold text-oxford-900 mb-4">{val.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 text-center reveal-up">
          <div className="container mx-auto px-6 max-w-4xl">
            <h4 className="text-3xl md:text-5xl font-serif font-bold text-oxford-900 mb-10 leading-tight">
              Ready to Secure Your <span className="brand-gradient italic">Justice?</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/billing" className="group relative px-12 py-5 bg-oxford-900 text-gold-400 font-bold border border-gold-500/30 rounded-2xl text-center shadow-lg hover:shadow-gold-500/20 transition-all uppercase tracking-widest text-xs overflow-hidden">
                <span className="relative z-10 group-hover:text-oxford-900 transition-colors">Start Consultation</span>
                <div className="absolute inset-0 bg-gold-500 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              </Link>
              <Link href="/emergency" className="px-12 py-5 border-2 border-red-600 text-red-600 rounded-2xl font-bold tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all text-xs">
                Emergency SOS
              </Link>
            </div>
          </div>
      </section>

    </main>
  );
}
