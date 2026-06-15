"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { seededRandom } from "@/utils/random";

const categories = [
  {
    title: "Mental Health Support",
    desc: "Targeted strategies for stress, anxiety, overthinking, and emotional burnout.",
    icon: "fa-brain",
    color: "from-blue-500/10 to-transparent"
  },
  {
    title: "Relationship Resolution",
    desc: "Foster deep communication, resolve trust barriers, and heal together after conflict.",
    icon: "fa-heart",
    color: "from-red-500/10 to-transparent"
  },
  {
    title: "Family Integrity",
    desc: "Mediate parenting conflicts, generational stress, and interpersonal household dynamics.",
    icon: "fa-people-roof",
    color: "from-indigo-500/10 to-transparent"
  },
  {
    title: "Career Strategic Growth",
    desc: "Professional guidance for career transitions, academic pressure, and high-performance motivation.",
    icon: "fa-briefcase",
    color: "from-orange-500/10 to-transparent"
  },
  {
    title: "Trauma Recovery",
    desc: "Surgical approach to fear, panic triggers, and rebuilding core confidence after hardship.",
    icon: "fa-user-shield",
    color: "from-yellow-500/10 to-transparent"
  },
  {
    title: "Elite Personal Growth",
    desc: "Advanced goal-setting, self-esteem cultivation, and neurological focus techniques.",
    icon: "fa-seedling",
    color: "from-green-500/10 to-transparent"
  }
];

const faqs = [
  {
    q: "Is the counselling process privileged?",
    a: "Absolutely. We treat counselling with the same level of legal privilege and record security as your advocate consultations. Your privacy is non-negotiable."
  },
  {
    q: "Can I choose between virtual or physical sessions?",
    a: "Yes. We offer secure, end-to-end encrypted video consultations or discreet in-person sessions at our private executive suites."
  },
  {
    q: "What is the expected protocol for session counts?",
    a: "Recovery and growth are non-linear. Some clients achieve strategic clarity in 4 sessions, while others maintain a high-performance monthly retainer."
  },
  {
    q: "Do you handle emotional distress from legal cases?",
    a: "This is our specialization. We provide psychological support specifically tailored to clients undergoing intense legal litigation or high-stakes disputes."
  },
  {
    q: "What are the professional investment tiers?",
    a: "Standard sessions with our senior psychologists start at ₹1,499. We offer premium packages for long-term strategic mental wellness."
  }
];

export default function Counselling() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    // Staggered Fade Up
    gsap.utils.toArray<HTMLElement>('.stagger-parent').forEach(parent => {
      const children = parent.children;
      gsap.fromTo(children, 
        { autoAlpha: 0, y: 30 },
        { 
          autoAlpha: 1, 
          y: 0, 
          duration: 1, 
          stagger: 0.15, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: parent,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main className="flex-1 bg-white overflow-hidden">
      {/* 1. Cinematic Hero Section */}
      <section className="relative hero-gradient min-h-[80vh] flex items-center justify-center overflow-hidden border-b-[10px] border-gold-500/20">
        <div className="absolute inset-0 z-0 opacity-40">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                top: `${seededRandom(i * 5) * 100}%`, 
                left: `${seededRandom(i * 5 + 1) * 100}%`,
                animationDelay: `${seededRandom(i * 5 + 2) * 20}s`,
                width: `${seededRandom(i * 5 + 3) * 4 + 2}px`,
                height: `${seededRandom(i * 5 + 4) * 4 + 2}px`,
                background: i % 2 === 0 ? '#d4af37' : 'white'
              }} 
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <div className="reveal-up mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl mb-8">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-400">Mental Wellness Initiative</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-serif font-bold tracking-tight text-white mb-8 leading-[1.1]">
              From Heavy Thoughts <br /> to a <span className="brand-gradient italic">Lighter Life</span>
            </h1>
          </div>
          
          <p className="reveal-up text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Private, judgment-free counselling for high-performance minds. Resolving complexity in mental health, relationships, and professional growth.
          </p>
          
          <div className="reveal-up flex flex-col sm:flex-row gap-6 relative">
            <Link href="/billing" className="group relative overflow-hidden bg-gold-500 text-oxford-900 px-12 py-5 rounded-full font-bold tracking-widest uppercase transition-all shadow-gold hover:scale-105 active:scale-95">
              <span className="relative z-10 transition-colors group-hover:text-white">Book Therapy</span>
              <div className="absolute inset-0 bg-oxford-800 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            </Link>
            <Link href="#about" className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-oxford-900 transition-all backdrop-blur-sm">
              Our Philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Philosophy & Methodology Section */}
      <section id="about" className="py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 reveal-up">
              <div className="relative rounded-[40px] overflow-hidden shadow-oxford aspect-[4/5]">
                <Image 
                  src="https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?q=80&w=1000&auto=format&fit=crop" 
                  width={800} 
                  height={1000} 
                  alt="High-fidelity therapy space" 
                  className="w-full h-full object-cover grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-oxford-900 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-12 left-12 right-12">
                   <div className="glass-panel p-8 rounded-3xl border border-white/20 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-oxford-900 bg-slate-200 overflow-hidden relative">
                            <Image src={`https://i.pravatar.cc/100?u=doc${i}`} alt="Specialist" width={40} height={40} />
                          </div>
                        ))}
                      </div>
                      <Link href="/login" className="bg-gold-500 text-oxford-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Career Access</Link>
                   </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 stagger-parent">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gold-600 mb-6">Our Methodology</h2>
              <h3 className="text-5xl font-serif font-bold text-oxford-900 mb-10 leading-tight">Elite Psychological <br /> <span className="italic text-slate-400">Restoration & Growth.</span></h3>
              
              <div className="space-y-8 text-slate-500 font-light leading-relaxed text-lg">
                <p>
                  At NaiyeBharat, we recognize that mental wellness is as critical as legal security. We provide a sanctuary for high-stakes professionals and individuals undergoing complex life transitions.
                </p>
                <p>
                  Our methodology prioritizes <strong>Absolute Confidentiality</strong>. We connect you with verified specialists who understand the intricate intersection of emotional well-being, stressful litigation, and corporate demand. This is not just therapy; it&apos;s a strategic investment in your resilience.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8 text-oxford-900">
                <div className="space-y-2">
                  <div className="text-3xl font-serif font-bold italic text-gold-600">100%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest">Privileged Data</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-serif font-bold italic text-gold-600">Elite</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest">Specialist Network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. High-Fidelity Service Grid */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 text-center mb-24 reveal-up">
           <div className="inline-block px-4 py-1.5 bg-white border border-slate-100 rounded-full text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">
             Specialized Modalities
           </div>
           <h2 className="text-5xl md:text-7xl font-serif font-bold text-oxford-900">Therapeutic Sectors</h2>
           <div className="w-24 h-1 bg-gold-500 mx-auto mt-8"></div>
        </div>

        <div className="container mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-parent">
          {categories.map((cat, i) => (
            <div key={i} className="group bg-white p-12 rounded-[40px] shadow-oxford border border-slate-50 hover:border-gold-500/20 transition-all duration-700 hover:-translate-y-4 flex flex-col relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} rounded-bl-[100px] transition-all duration-500 group-hover:scale-150 group-hover:opacity-40`}></div>
               
               <div className="w-16 h-16 rounded-2xl bg-oxford-900 flex items-center justify-center text-gold-500 mb-10 relative z-10 transition-transform duration-500 group-hover:scale-110">
                 <i className={`fas ${cat.icon} text-2xl`}></i>
               </div>
               
               <h3 className="text-2xl font-serif font-bold text-oxford-900 mb-4 relative z-10">{cat.title}</h3>
               <p className="text-slate-500 leading-relaxed font-light text-sm relative z-10">{cat.desc}</p>
               
               <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-gold-600 transition-colors">Learn More</span>
                 <i className="fas fa-arrow-right-long text-slate-200 group-hover:text-gold-500 transition-all group-hover:translate-x-2"></i>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Strategic FAQ Section */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20 reveal-up">
            <h2 className="text-5xl font-serif font-bold text-oxford-900 mb-6">Protocols & Insight</h2>
            <p className="text-slate-400 font-light italic">&quot;Total transparency is the first step toward restoration.&quot;</p>
            <div className="w-16 h-1 bg-gold-500 mx-auto mt-8"></div>
          </div>

          <div className="space-y-6 stagger-parent">
            {faqs.map((faq, i) => (
              <div key={i} className="group border-b border-slate-100 transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-8 text-left flex justify-between items-center transition-all group-hover:pl-4"
                >
                  <span className={`font-serif font-bold text-xl transition-all ${openFaq === i ? 'text-gold-600' : 'text-oxford-900'}`}>{faq.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${openFaq === i ? 'bg-oxford-900 border-oxford-900 text-gold-500 rotate-180' : 'border-slate-100 text-slate-300'}`}>
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </button>
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 text-slate-500 font-light leading-relaxed text-lg border-l-2 border-gold-500/20 ml-2">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact CTA */}
      <section className="py-32 bg-oxford-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#d4af37,transparent)]"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
           <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-10 leading-tight reveal-up">Ready to find <br /> your <span className="brand-gradient italic">Center</span>?</h2>
           <Link href="/billing" className="reveal-up inline-block bg-gold-500 text-oxford-900 px-16 py-6 rounded-full font-bold tracking-[0.2em] uppercase transition-all shadow-gold hover:scale-105 active:scale-95">
             Iniate Consultation
           </Link>
        </div>
      </section>
    </main>
  );
}
