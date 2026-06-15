"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { seededRandom } from "@/utils/random";

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceInfo {
  title: string;
  subtitle: string;
  description: string;
  items: string[];
  whatWeDo: string[];
  whyUs: string;
  faqs: FAQ[];
  icon: string;
}

const servicesData: Record<string, ServiceInfo> = {
  civil: {
    title: "Civil Litigation",
    subtitle: "Strategic representation in high-stakes civil disputes and complex property matters.",
    description: "Civil law deals with disputes between individuals or businesses related to rights, property, and money. We provide expert guidance on contract breaches, recovery of dues, and landlord-tenant issues with surgical precision.",
    items: ["Property & Real Estate Disputes", "Contractual Breach Litigation", "Personal Injury & Torts", "Consumer Rights Advocacy", "Defamation Suits"],
    whatWeDo: [
      "Strategic litigation planning and case analysis.",
      "Drafting robust legal notices and court filings.",
      "Expert representation in lower and high courts."
    ],
    whyUs: "We offer precise legal action with a focus on avoiding unnecessary delays and protecting your long-term assets.",
    faqs: [
      { question: "How long does a civil case take?", answer: "While timelines vary, we prioritize faster tracks and early mediation where possible." },
      { question: "Can I settle outside of court?", answer: "Yes, we encourage and facilitate settlements to save time and emotional bandwidth." }
    ],
    icon: "fas fa-balance-scale"
  },
  criminal: {
    title: "Criminal Defense",
    subtitle: "Relentless defense in criminal matters, white-collar cases, and appellate courts.",
    description: "Criminal law requires an aggressive and immediate response. Whether it is bail applications or FIR handling, our team provides the tactical expertise needed to protect your freedom and reputation.",
    items: ["Bail & Anticipatory Bail", "White-Collar Crime Defense", "Appellate Representation", "Cyber Crime Response", "Trial Advocacy"],
    whatWeDo: [
      "Immediate legal intervention and FIR management.",
      "Expert witness analysis and evidence gathering.",
      "Vigorous trial representation."
    ],
    whyUs: "Quick response, strict confidentiality, and access to highly skilled defense advocates.",
    faqs: [
      { question: "How do I apply for bail?", answer: "We file immediate applications in the relevant court, ensuring all legal requirements are met for swift relief." }
    ],
    icon: "fas fa-gavel"
  },
  corporate: {
    title: "Corporate Law",
    subtitle: "Legal architecture for businesses, navigating compliance and mergers with precision.",
    description: "Our corporate team ensures your business foundation is unbreakable. From company registration to complex shareholder agreements, we provide the legal backbone for your commercial success.",
    items: ["Company Registration", "Compliance & Governance", "M&A Strategy", "Contract Audits", "IP Protection"],
    whatWeDo: [
      "Structuring legal frameworks for startups/enterprises.",
      "Managing regulatory compliance audits.",
      "Negotiating high-value commercial contracts."
    ],
    whyUs: "Professional, confidential approach focused on scalability and risk mitigation.",
    faqs: [
      { question: "What is the best structure for my startup?", answer: "We analyze your funding needs and goals to recommend PVT LTD vs LLP." }
    ],
    icon: "fas fa-building"
  },
  family: {
    title: "Family & Matrimonial",
    subtitle: "Compassionate counsel for divorce, child custody, and sensitive family disputes.",
    description: "Matrimonial issues are deeply personal. We provide the emotional intelligence and legal expertise required to navigate these sensitive matters with dignity and fairness.",
    items: ["Contested & Mutual Divorce", "Child Custody & Maintenance", "Adoption Legalities", "Domestic Violence Protection", "Conjugal Rights"],
    whatWeDo: [
      "Mediation-first approach to minimize trauma.",
      "Aggressive representation in family courts if mediation fails.",
      "Clear, actionable advice on maintenance and assets."
    ],
    whyUs: "Strict confidentiality and an empathetic, child-focused approach to litigation.",
    faqs: [
      { question: "How long is the divorce process?", answer: "Mutual consent can take 6 months, while contested cases depend on complexity." }
    ],
    icon: "fas fa-users"
  },
  property: {
    title: "Property & Real Estate",
    subtitle: "Guidance on real estate acquisitions, title verification, and massive litigation.",
    description: "Real estate is a key asset. We protect your investments through meticulous title verification and aggressive representation in RERA and civil court disputes.",
    items: ["Commercial Acquisitions", "Title Due Diligence", "Builder-Buyer Disputes", "RERA Litigation", "Deed Registration"],
    whatWeDo: [
      "Comprehensive 30-year title searches.",
      "Drafting ironclad sale and lease agreements.",
      "Representing clients in complex property litigations."
    ],
    whyUs: "Transparent advice and a track record of protecting substantial property investments.",
    faqs: [
      { question: "How to check property disputes?", answer: "We perform digital and physical records audits at relevant registrar offices." }
    ],
    icon: "fas fa-home"
  },
  "court-marriage": {
    title: "Court Marriage",
    subtitle: "End-to-end assistance through court marriage registrations and certifications.",
    description: "We simplify the legal requirements for court marriage under various acts, ensuring a smooth, legally recognized ceremony and certificate issuance.",
    items: ["Special Marriage Act Registration", "Hindu Marriage Act Certificates", "Police Protection Guidance", "Same-Day Registration Support", "International Marriage Documentation"],
    whatWeDo: [
      "Seamless document verification and notice filing.",
      "Scheduling and coordination with the Marriage Registrar.",
      "Ensuring all legal formalities are met for immediate certificate issuance."
    ],
    whyUs: "Fast-track, hassle-free processing with complete legal verification.",
    faqs: [
      { question: "Are witnesses required?", answer: "Yes, three valid witnesses with proof of identity are mandatory." }
    ],
    icon: "fas fa-ring"
  }
};

export default function ServicePage() {
  const params = useParams();
  const id = params.id as string;
  
  const data = servicesData[id];

  useEffect(() => {
    if (!data) return;
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
  }, [data]);

  if (!data) return notFound();

  return (
    <main className="flex-1 bg-white">
      {/* Premium Hero Banner */}
      <section className="relative hero-gradient py-32 flex items-center justify-center overflow-hidden border-b-8 border-gold-500/10">
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
          <div className="w-20 h-20 bg-gold-400/10 border border-gold-400/30 rounded-full flex items-center justify-center mx-auto mb-8 text-gold-400">
            <i className={`${data.icon} text-3xl`}></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            {data.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            {data.subtitle}
          </p>
        </div>
      </section>
      
      {/* Content Area */}
      <section className="py-24 px-6 relative z-10 -mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-16">
              <div className="reveal-up">
                <h2 className="text-xs font-bold tracking-[0.4em] text-gold-600 uppercase mb-4 text-left">The Mandate</h2>
                <h3 className="text-3xl font-serif font-bold text-oxford-900 mb-8 border-l-4 border-gold-500 pl-6 text-left">About {data.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-light mb-10 text-left">
                  {data.description}
                </p>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-oxford-900 mb-4 uppercase text-xs tracking-widest text-left">Execution Strategy</h4>
                  <ul className="space-y-4">
                    {data.whatWeDo.map((step, i) => (
                      <li key={i} className="flex gap-4 text-slate-700 text-sm italic items-baseline">
                        <span className="text-gold-500 font-bold">0{i+1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="reveal-up pt-10">
                <h3 className="text-2xl font-serif font-bold text-oxford-900 mb-10 text-left">Frequently Consulted</h3>
                <div className="space-y-6">
                  {data.faqs.map((faq, i) => (
                    <div key={i} className="group bg-white p-8 rounded-2xl border border-slate-100 hover:border-gold-500/30 hover:shadow-xl transition-all duration-300">
                      <h4 className="font-bold text-oxford-900 mb-3 flex items-center gap-3 text-left">
                        <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
                        {faq.question}
                      </h4>
                      <p className="text-slate-500 text-sm pl-4 leading-relaxed font-light text-left">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Column - Key Areas */}
            <div className="reveal-up">
              <div className="bg-white rounded-[40px] shadow-oxford p-10 border border-slate-50 sticky top-32">
                <h3 className="text-xl font-serif font-bold text-oxford-900 mb-8 text-left">Specific Focus Areas</h3>
                <ul className="space-y-4">
                  {data.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-700 bg-slate-50 p-5 rounded-xl border border-slate-100 hover:shadow-md transition-all group">
                      <i className="fas fa-check-circle text-gold-500 group-hover:scale-110 transition-transform"></i>
                      <span className="font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-12 bg-oxford-50 p-8 rounded-3xl border border-oxford-100">
                  <h4 className="font-bold text-oxford-900 mb-3 text-xs uppercase tracking-widest text-left">Legal Intelligence</h4>
                  <p className="text-slate-600 text-[13px] italic leading-relaxed text-left">&quot;{data.whyUs}&quot;</p>
                </div>

                <Link href="/billing" className="mt-10 block w-full py-5 bg-oxford-900 text-gold-400 font-bold border border-gold-500/30 rounded-2xl text-center shadow-lg hover:bg-gold-500 hover:text-oxford-900 transition-all uppercase tracking-widest text-xs relative overflow-hidden group">
                  <span className="relative z-10 transition-transform group-hover:scale-105">Book Urgent Call</span>
                  <div className="absolute inset-0 bg-gold-500 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-oxford-900 py-16 text-center reveal-up border-t border-gold-500/10">
        <h4 className="text-white text-2xl font-serif italic mb-8">Professional guidance is just a call away.</h4>
        <Link href="/emergency" className="inline-block px-12 py-4 border-2 border-red-600 text-red-500 rounded-full font-bold tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
          Emergency Response
        </Link>
      </section>
    </main>
  );
}
