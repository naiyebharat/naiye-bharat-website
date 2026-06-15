"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => Promise<void>;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open: () => void; }
interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }
interface OrderData { success: boolean; key_id: string; order: { id: string; amount: number; currency: string }; }
interface VerifyData { success: boolean; payment_id: string; order_id: string; }
interface EmailData { success: boolean; }
interface ContactFormData { name: string; email: string; phone: string; caseType: string; occupation: string; subject: string; message: string; }

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ── LogoSVG ────────────────────────────────────────────────────────────────
function LogoSVG({ size = "small" }: { size?: "small" | "large" }) {
  if (size === "large") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#d4af37" strokeWidth="3" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="4,3" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="2,1" />
        <rect x="46" y="22" width="8" height="50" fill="#d4af37" />
        <rect x="38" y="65" width="24" height="10" rx="5" fill="#d4af37" />
        <rect x="41" y="62" width="18" height="6" rx="3" fill="#d4af37" />
        <circle cx="50" cy="20" r="4" fill="#d4af37" />
        <rect x="43" y="16" width="14" height="8" rx="4" fill="#d4af37" />
        <rect x="25" y="32" width="50" height="4" fill="#d4af37" />
        <circle cx="35" cy="38" r="2.5" fill="#d4af37" />
        <line x1="35" y1="40" x2="35" y2="58" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="35" y1="40" x2="27" y2="48" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="35" y1="40" x2="43" y2="48" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M 24 48 Q 35 58 46 48 L 46 53 Q 35 63 24 53 Z" fill="#d4af37" />
        <circle cx="65" cy="38" r="2.5" fill="#d4af37" />
        <line x1="65" y1="40" x2="65" y2="58" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="65" y1="40" x2="57" y2="48" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="65" y1="40" x2="73" y2="48" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M 54 48 Q 65 58 76 48 L 76 53 Q 65 63 54 53 Z" fill="#d4af37" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,2" />
      <rect x="47" y="25" width="6" height="45" fill="#d4af37" />
      <rect x="40" y="65" width="20" height="8" rx="4" fill="#d4af37" />
      <rect x="44" y="20" width="12" height="6" rx="3" fill="#d4af37" />
      <rect x="30" y="35" width="40" height="3" fill="#d4af37" />
      <circle cx="38" cy="40" r="2" fill="#d4af37" />
      <line x1="38" y1="42" x2="38" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="32" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="44" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 30 48 Q 38 55 46 48 L 46 52 Q 38 59 30 52 Z" fill="#d4af37" />
      <circle cx="62" cy="40" r="2" fill="#d4af37" />
      <line x1="62" y1="42" x2="62" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="56" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="68" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 54 48 Q 62 55 70 48 L 70 52 Q 62 59 54 52 Z" fill="#d4af37" />
    </svg>
  );
}

// ── cardsData ──────────────────────────────────────────────────────────────
const cardsData = [
  { image: "/img/WhatsAppImage2026-01-24at4.16.15PM.jpeg",  name: "Brijpal yadav",    handle: "@brijwrites",      date: "April 20, 2025", review: "न्याय की दिशा में एक सराहनीय प्रयास। सरल भाषा और भरोसेमंद मार्गदर्शन मिलता है।" },
  { image: "/img/WhatsAppImage2026-01-24at4.01.16PM.jpeg",  name: "anand mishra",     handle: "@anandmishra",     date: "May 10, 2025",   review: "यह प्लेटफॉर्म कानून को आम लोगों के लिए आसान बनाता है। अनुभव बहुत अच्छा रहा।" },
  { image: "/img/WhatsAppImage2026-01-24at4.02.17PM.jpeg",  name: "brijmohan singh",  handle: "@brijmohansingh",  date: "June 5, 2025",   review: "कानूनी सहायता के साथ-साथ मानसिक सहयोग भी मिलता है, जो इसे दूसरों से अलग बनाता है।" },
  { image: "/img/WhatsAppImage2026-01-24at4.01.15PM.jpeg",  name: "sheela kumari",    handle: "@sheelakumari",    date: "May 10, 2025",   review: "मुझे यहाँ सही समय पर सही सलाह मिली। टीम बहुत सहयोगी और समझदार है।" },
  { image: "/img/IMG_20260124_155610990.jpg.jpeg",           name: "guddu",            handle: "@gudduX",          date: "May 10, 2025",   review: "न्याय की दिशा में एक महत्वपूर्ण कदम। सरल भाषा में समझाया गया है जो सभी के लिए उपयोगी है।" },
  { image: "/img/WhatsAppImage2026-01-24at4.20.04PM.jpeg",  name: "abhishek sharma",  handle: "@abhisheksharma",  date: "May 10, 2025",   review: "Court aur lawyer ke chakkar samajhna mushkil hota hai, but is website ne sab easy bana diya." },
  { image: "/img/WhatsAppImage2026-01-24at4.20.05PM.jpeg",  name: "abhi ojha",        handle: "@abhi_ojha",       date: "May 10, 2025",   review: "Simple language, clear advice aur fast response. First-time users ke liye perfect platform." },
  { image: "/img/WhatsAppImage2026-01-24at4.25.04PM.jpeg",  name: "shivam",           handle: "@shivamwrites",    date: "May 10, 2025",   review: "Mujhe doubt tha online legal help pe, but NaiyeBharat ne mera bharosa jeet liya." },
  { image: "/img/WhatsAppImage2026-01-24at4.27.06PM.jpeg",  name: "manmohan singh",   handle: "@manmohansingh",   date: "May 10, 2025",   review: "Bahut hi useful website hai. Legal problem ho ya guidance chahiye ho, yahan proper solution milta hai." },
  { image: "/img/WhatsAppImage2026-01-24at4.28.30PM.jpeg",  name: "gopal",            handle: "@gopalwrites",     date: "May 10, 2025",   review: "NaiyeBharat ne mere legal case ko samajhne mein madad ki aur sahi direction di. Highly recommended!" },
  { image: "/img/WhatsAppImage2026-01-24at4.33.38PM.jpeg",  name: "priyanka",         handle: "@priyankawrites",  date: "May 10, 2025",   review: "Clean interface, genuine support, and quick response. Highly recommended for anyone seeking legal clarity." },
  { image: "/img/WhatsAppImage2026-01-24at4.42.58PM.jpeg",  name: "eaklavya",         handle: "@averywrites",     date: "May 10, 2025",   review: "A trustworthy platform that combines legal knowledge with emotional understanding. Much needed in today's time." },
];

// ── servicesData ───────────────────────────────────────────────────────────
const servicesData = [
  {href:"/civil",          grad:"from-blue-500 to-blue-600",    title:"Civil Law",      desc:"Expert representation in civil disputes, property matters, and contract issues.",      items:["Property disputes","Contract law","Personal injury","Consumer rights"],         icon:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>},
  {href:"/criminal",       grad:"from-red-500 to-red-600",      title:"Criminal law",   desc:"Aggressive defense and prosecution in criminal matters with proven track record.",       items:["Criminal defense","Bail applications","White collar crime","Appeals"],           icon:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>},
  {href:"/corporate",      grad:"from-green-500 to-green-600",  title:"Corporate law",  desc:"Complete corporate legal solutions for businesses of all sizes.",                        items:["Company formation","Mergers & acquisitions","Compliance","Commercial contracts"],icon:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>},
  {href:"/family",         grad:"from-purple-500 to-purple-600",title:"Family Law",     desc:"Compassionate handling of sensitive family matters and disputes.",                      items:["Divorce proceedings","Child custody","Adoption","Domestic violence"],            icon:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>},
  {href:"/property",       grad:"from-orange-500 to-orange-600",title:"Property Law",   desc:"Expert guidance on property transactions and real estate matters.",                     items:["Property purchase","Title verification","Property disputes","Registration"],      icon:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>},
  {href:"/court-marriage", grad:"from-indigo-500 to-indigo-600",title:"Court Marriage", desc:"Comprehensive assistance with court marriage procedures and documentation.",             items:["Court marriage","Marriage certificate"],                                          icon:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>},
];

const statsData = [
  {target:20,   suffix:"+", label:"Years of experience"},
  {target:2000, suffix:"+", label:"Cases Handled"},
  {target:80,   suffix:"%", label:"Satisfaction Rate"},
  {target:500,  suffix:"+", label:"Reviews"},
];

const featureItems = ["20+ Years of Experience","2000+ Cases handled","80% Client satisfaction"];

const teamData = [
  {img:"/img/Whisk_aff5053394f6de492e542cc13992ded3dr_11zon.jpg",        name:"Adv Praveen Kumar Singh", role:"Criminal disputes"},
  {img:"/img/WhatsApp Image 2026-01-24 at 6.09.44 PM_11zon.jpeg",        name:"Adv Ranvijay Singh",      role:"Legal documentation"},
  {img:"/img/0a391927-508d-4e74-b234-03e066a05609_11zon.jpg",            name:"Adv Sharda Singh",        role:"Family matters"},
];

const particles = [
  {t:"top-20 left-10",s:"w-4 h-4",o:"10",d:"0s"},
  {t:"top-40 right-20",s:"w-2 h-2",o:"20",d:"1s"},
  {t:"bottom-32 left-1/4",s:"w-3 h-3",o:"15",d:"2s"},
  {t:"top-1/2 right-1/3",s:"w-2 h-2",o:"10",d:"0.5s"},
];

// ── Animated counter (runs on mount, no scroll dependency) ──────────────────
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setValue(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div className="flex items-baseline justify-center">
      <span className="counter-number text-blue-600">{value}</span>
      <span className="text-blue-600 text-3xl md:text-4xl font-bold ml-0.5">{suffix}</span>
    </div>
  );
}

// ── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({ c }: { c: typeof cardsData[0] }) {
  return (
    <div
      style={{ background: "#fff", border: "1px solid #e5e7eb", minWidth: "18rem" }}
      className="p-4 rounded-lg mx-3 shadow-md hover:shadow-lg transition-shadow duration-200 w-72 shrink-0"
    >
      <div className="flex gap-3 mb-3">
        <img
          src={c.image}
          alt={c.name}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{c.name}</p>
          <span className="text-xs text-slate-400">{c.handle}</span>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{c.review}</p>
      <p className="text-xs text-slate-400 mt-3 text-right">{c.date}</p>
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────
export default function Home() {
  const didInit = useRef(false);
  const doubledCards = [...cardsData, ...cardsData];

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (a as HTMLAnchorElement).getAttribute("href");
        if (href) document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Load Razorpay checkout script
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src; s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
    loadScript("https://checkout.razorpay.com/v1/checkout.js").catch(() => {});
  }, []);

  // ── Payment helpers ────────────────────────────────────────────────────
  const showMessage = useCallback((message: string, type: string) => {
    const el = document.getElementById("statusMessage");
    if (!el) return;
    el.textContent = message;
    el.className = `p-4 rounded-md ${type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-yellow-600"}`;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 5000);
  }, []);

  const submitForm = useCallback(async (formData: ContactFormData, paymentData: VerifyData, BACKEND_URL: string) => {
    const btn = document.getElementById("payButton") as HTMLButtonElement;
    try {
      const res  = await fetch(`${BACKEND_URL}/api/send-email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, payment_id: paymentData.payment_id, order_id: paymentData.order_id }) });
      const data: EmailData = await res.json();
      if (data.success) { showMessage("Payment successful! Your message has been sent.", "success"); (document.getElementById("contactForm") as HTMLFormElement).reset(); }
      else throw new Error("Email failed");
    } catch { showMessage("Payment successful but message delivery failed. We will contact you.", "warning"); }
    finally { btn.disabled = false; btn.textContent = "Pay ₹999 & Submit"; }
  }, [showMessage]);

  const verifyPayment = useCallback(async (paymentResponse: RazorpayResponse, formData: ContactFormData, BACKEND_URL: string) => {
    const btn = document.getElementById("payButton") as HTMLButtonElement;
    try {
      const res  = await fetch(`${BACKEND_URL}/api/verify-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentResponse) });
      const data: VerifyData = await res.json();
      if (data.success) await submitForm(formData, data, BACKEND_URL);
      else throw new Error("Verify failed");
    } catch { showMessage("Payment verification failed. Please contact support.", "error"); btn.disabled = false; btn.textContent = "Pay ₹999 & Submit"; }
  }, [showMessage, submitForm]);

  const startPayment = useCallback(async () => {
    const BACKEND_URL = "https://naiyebharat.onrender.com";
    const form = document.getElementById("contactForm") as HTMLFormElement;
    const btn  = document.getElementById("payButton") as HTMLButtonElement;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const formData: ContactFormData = {
      name:       (document.getElementById("name")       as HTMLInputElement).value,
      email:      (document.getElementById("email")      as HTMLInputElement).value,
      phone:      (document.getElementById("phone")      as HTMLInputElement).value,
      caseType:   (document.getElementById("caseType")   as HTMLSelectElement).value,
      occupation: (document.getElementById("occupation") as HTMLInputElement).value,
      subject:    (document.getElementById("subject")    as HTMLInputElement).value,
      message:    (document.getElementById("message")    as HTMLTextAreaElement).value,
    };
    try {
      btn.disabled = true; btn.textContent = "Processing...";
      const orderRes  = await fetch(`${BACKEND_URL}/api/create-order`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: 999, currency: "INR", receipt: `receipt_${Date.now()}`, notes: { name: formData.name, email: formData.email, subject: formData.subject } }) });
      const orderData: OrderData = await orderRes.json();
      if (!orderData.success) throw new Error("Order failed");
      const rzp = new window.Razorpay({
        key: orderData.key_id, amount: orderData.order.amount, currency: orderData.order.currency,
        name: "Legal Consultation", description: formData.subject, order_id: orderData.order.id,
        prefill: { name: formData.name, email: formData.email }, theme: { color: "#2563eb" },
        handler: async (r) => { await verifyPayment(r, formData, BACKEND_URL); },
        modal: { ondismiss: () => { btn.disabled = false; btn.textContent = "Pay ₹999 & Submit"; showMessage("Payment cancelled", "error"); } },
      });
      rzp.open();
    } catch { showMessage("Error initiating payment. Please try again.", "error"); btn.disabled = false; btn.textContent = "Pay ₹999 & Submit"; }
  }, [showMessage, verifyPayment]);

  // ── JSX ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }

        @keyframes spin-once { to { transform: rotate(360deg); } }
        .rotate-once { animation: spin-once 2s ease-in-out 1; }

        @keyframes logoGlow {
          0%   { filter: drop-shadow(0 0 0px  rgba(212,175,55,0)); }
          50%  { filter: drop-shadow(0 0 15px rgba(212,175,55,0.8)); }
          100% { filter: drop-shadow(0 0 8px  rgba(212,175,55,0.4)); }
        }
        .animate-logo-glow { animation: logoGlow 2s ease-in-out 0.5s both; }

        @keyframes textCascade {
          from { opacity: 0; transform: translateX(-80px) scale(0.85); filter: blur(8px); }
          to   { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        .animate-cascade { animation: textCascade 1.2s ease-out both; }

        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }

        .parallax-bg { background-attachment: fixed; background-position: center; background-size: cover; }
        .gradient-text { background: linear-gradient(45deg,#3b82f6,#8b5cf6,#06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .interactive-bg { position: relative; overflow: hidden; }
        .interactive-bg::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%); transform:scale(0); transition:transform 0.5s ease; }
        .interactive-bg:hover::before { transform:scale(1); }

        .counter-number { font-weight:800; font-size:2.5rem; line-height:1; }

        @keyframes marqueeL { from { transform:translateX(0); }    to { transform:translateX(-50%); } }
        @keyframes marqueeR { from { transform:translateX(-50%); } to { transform:translateX(0); }    }
        .marquee-l { animation: marqueeL 30s linear infinite; will-change:transform; }
        .marquee-r { animation: marqueeR 30s linear infinite; will-change:transform; }

        .sos-banner { position:absolute; top:15px; right:15px; width:50px; height:50px; cursor:pointer; z-index:20; display:flex; align-items:center; justify-content:center; clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%); background:linear-gradient(145deg,#ff4a4a,#b91c1c); box-shadow:0 4px 8px rgba(0,0,0,0.4); transition:all 0.3s; }
        .sos-banner:hover { transform:scale(1.1); box-shadow:0 6px 16px rgba(0,0,0,0.5),0 0 20px rgba(220,38,38,0.7); }
        .sos-banner:active { transform:scale(0.95); }
        .sos-title { color:#fff; font-size:13px; font-weight:800; letter-spacing:0.5px; text-shadow:0 1px 3px rgba(0,0,0,0.6); }
        @media(min-width:768px){ .sos-banner{width:65px;height:65px;top:20px;right:20px;} .sos-title{font-size:16px;} }
        @media(max-width:374px){ .sos-banner{width:45px;height:45px;} .sos-title{font-size:12px;} }

        @media(max-width:768px){ .stat-item{padding:1rem 0.5rem;} }
        .stat-item p { word-wrap:break-word; hyphens:auto; }
      `}</style>

      <div className="bg-gray-50">

        {/* ── HERO ── */}
        <section id="home" className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 parallax-bg relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p,i) => (
              <div key={i} className={`animate-float absolute ${p.t} ${p.s} bg-white/${p.o} rounded-full`} style={{animationDelay:p.d}} />
            ))}
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rotate-once animate-logo-glow">
                <LogoSVG size="large" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold animate-cascade gradient-text" style={{animationDelay:"1.2s"}}>
                NaiyeBharat
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-4 text-blue-100 animate-cascade" style={{animationDelay:"1.5s"}}>Your trusted Legal Partner</p>
            <p className="text-lg md:text-xl mb-8 text-blue-200 max-w-3xl mx-auto animate-cascade" style={{animationDelay:"1.8s"}}>
              Providing comprehensive legal solutions with integrity, expertise and dedication.
              We are committed to protecting your rights and delivering justice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-cascade" style={{animationDelay:"2.1s"}}>
              <a href="/counseling"  className="bg-white text-blue-700 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 interactive-bg">Book consultation</a>
              <a href="/counseling" className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-700 transition-all transform hover:scale-105 interactive-bg">Mental health counselling</a>
            </div>
          </div>
          <div className="sos-banner" onClick={() => (window.location.href="/emergency")}>
            <span className="sos-title">SOS</span>
          </div>
        </section>

        {/* ── STATS / COUNTERS ── */}
        {/* <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsData.map(({target,suffix,label}) => (
                <div key={label} className="stat-item text-center">
                  <Counter target={target} suffix={suffix} />
                  <p className="text-gray-600 font-medium text-sm md:text-base mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── ABOUT ── */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4 gradient-text">About NaiyeBharat</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8" />
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Team with over two decades of experience, we stand as pillars of justice in the legal landscape of India.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Legacy of Excellence</h3>
                <p className="text-gray-600 mb-4">Since our establishment, NaiyeBharat has been at the forefront of legal innovation, combining traditional values with modern legal practices.</p>
                <p className="text-gray-600 mb-6">Our team of expert attorneys has successfully handled over 2000+ cases, ensuring justice and legal protection for individuals and businesses alike.</p>
                <div className="space-y-4">
                  {featureItems.map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full overflow-hidden h-auto md:h-[600px]">
                <Image src="/img/justice.PNG" alt="Lady Justice" width={600} height={800} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-slate-800 text-center mb-2">Meet some of Our team</h2>
            <p className="text-slate-500 text-center mb-12">The people behind the product, passionate about what they do.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {teamData.map(({img,name,role}) => (
                <div key={name} className="max-w-xs bg-black text-white rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img src={img} alt={name} className="h-64 w-full object-cover object-top hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  </div>
                  <div className="px-4 pb-5 text-center">
                    <p className="mt-3 text-lg font-medium">{name}</p>
                    <p className="text-sm font-medium bg-gradient-to-r from-[#8B5CF6] via-[#9938CA] to-[#E0724A] text-transparent bg-clip-text">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our legal services</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8" />
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive legal solutions tailored to meet your specific needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 services-grid">
              {servicesData.map(({href,grad,title,desc,items,icon}) => (
                <a key={title} href={href} className="contents">
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg card-hover interactive-bg border border-gray-100">
                    <div className={`w-16 h-16 bg-gradient-to-r ${grad} rounded-full flex items-center justify-center mx-auto mb-6 animate-float`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{desc}</p>
                    <ul className="text-sm text-gray-500 space-y-1 text-left">{items.map(it=><li key={it}>• {it}</li>)}</ul>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-16 bg-white overflow-hidden">
          <div className="container mx-auto px-4 text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6" />
            <p className="text-xl text-gray-600">Trusted by hundreds of clients across India</p>
          </div>
          {/* Row 1 — left */}
          <div className="w-full overflow-hidden relative mb-4">
            <div className="absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="marquee-l flex" style={{minWidth:"200%"}}>
              {doubledCards.map((c, i) => <TestimonialCard key={`r1-${i}`} c={c} />)}
            </div>
            <div className="absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
          {/* Row 2 — right */}
          <div className="w-full overflow-hidden relative">
            <div className="absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="marquee-r flex" style={{minWidth:"200%"}}>
              {doubledCards.map((c, i) => <TestimonialCard key={`r2-${i}`} c={c} />)}
            </div>
            <div className="absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </section>

        {/* ── MAP ── */}
        <div style={{width:"100%",height:"350px",overflow:"hidden",border:"1px solid #1f2937"}}>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.332044782906!2d77.21977717615498!3d28.529737688740042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce1f0adb989f9%3A0xd7b634f1086a782c!2sDistrict%20Court%20Saket!5e0!3m2!1sen!2sin!4v1769070836575!5m2!1sen!2sin"
            width="100%" height="350" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
        </div>

      </div>
    </>
  );
}