"use client";
import { useState } from "react";

const faqsData = [
  {
    question: "Is counseling confidential?",
    answer:
      "Yes. All counseling sessions are strictly confidential. Your personal information and discussions are protected and shared only with your consent, except where disclosure is required by law.",
  },
  {
    question: "Can counseling be done online or in person?",
    answer:
      "Yes. We offer both online and in-person counseling sessions. You can choose the mode that is most comfortable and convenient for you",
  },
  {
    question: "How many sessions are usually required?",
    answer:
      "The number of sessions depends on your concern and personal needs. Some issues may need only a few sessions, while others may require ongoing support.",
  },
  {
    question: "What issues can counseling help with?",
    answer:
      "Counseling can help with marital and family issues, emotional stress, anxiety, depression, trauma, domestic concerns, workplace stress, and challenges related to legal disputes",
  },
  {
    question: "What are the counseling charges?",
    answer:
      "Counseling charges vary based on the counselor's experience, session duration, and mode of consultation. We ensure transparent and affordable pricing with no hidden costs.",
  },
];

const counsellingTypes = [
  {
    emoji: "🧠",
    title: "Mental Health Counselling",
    desc: "Support for stress, anxiety, overthinking, low mood, and emotional burnout.",
  },
  {
    emoji: "❤️",
    title: "Relationship Counselling",
    desc: "Improve communication, trust, boundaries, and healing after conflicts or breakups.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Family Counselling",
    desc: "Resolve family stress, parenting issues, generational conflicts, and emotional pressure.",
  },
  {
    emoji: "💼",
    title: "Career & Study Counselling",
    desc: "Guidance for career confusion, academic stress, motivation issues, and decision-making.",
  },
  {
    emoji: "🧘",
    title: "Trauma & Healing Support",
    desc: "Help for past emotional wounds, fear, panic triggers, and rebuilding confidence.",
  },
  {
    emoji: "🌿",
    title: "Self Growth Counselling",
    desc: "Build self-esteem, set goals, improve habits, and feel more calm and focused daily.",
  },
];

export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes rotate {
          100% { transform: rotate(1turn); }
        }

        .rainbow::before {
          content: '';
          position: absolute;
          z-index: -2;
          left: -50%;
          top: -50%;
          width: 200%;
          height: 200%;
          background-position: 100% 50%;
          background-repeat: no-repeat;
          background-size: 50% 30%;
          filter: blur(6px);
          background-image: linear-gradient(#FF0A7F, #780EFF);
          animation: rotate 4s linear infinite;
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png')] w-full bg-no-repeat bg-cover bg-center text-sm pb-44">
        <div className="flex items-center gap-2 border border-slate-300 hover:border-slate-400/70 rounded-full w-max mx-auto px-4 py-2 mt-40 md:mt-32">
          <span>New announcement on your inbox</span>
          <button className="flex items-center gap-1 font-medium">
            <span>Read more</span>
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.959 9.5h11.083m0 0L9.501 3.958M15.042 9.5l-5.541 5.54"
                stroke="#050040"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <h5 className="text-4xl md:text-7xl font-medium max-w-[850px] text-center mx-auto mt-8">
          From heavy thoughts to a lighter life.
        </h5>

        <p className="text-sm md:text-base mx-auto max-w-2xl text-center mt-6 max-md:px-2">
          Private, judgment-free counselling for every concern mental health, relationships, career, and personal growth.
        </p>

        <div className="mx-auto w-full flex items-center justify-center gap-3 mt-4">
          <div className="rainbow relative z-0 overflow-hidden p-0.5 flex items-center justify-center rounded-full hover:scale-105 transition duration-300 active:scale-100">
            <a
              href="/counseling"
              className="px-8 text-sm py-3 text-white rounded-full font-medium bg-gray-800 inline-block"
            >
              book councelling
            </a>
          </div>
          <button className="flex items-center gap-2 border border-slate-300 hover:bg-slate-200/30 rounded-full px-6 py-3">
            <a
              href="https://en.wikipedia.org/wiki/Mental_health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <span>Learn More</span>
              <svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.25.5 4.75 4l-3.5 3.5"
                  stroke="#050040"
                  strokeOpacity=".4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </button>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 max-md:px-4 mt-10">
        <div className="relative shadow-2xl shadow-indigo-600/40 rounded-2xl overflow-hidden shrink-0">
          <img
            className="max-w-md w-full object-cover rounded-2xl"
            src="https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?q=80&w=451&h=451&auto=format&fit=crop"
            alt=""
          />
          <div className="flex items-center gap-1 max-w-72 absolute bottom-8 left-8 bg-white p-4 rounded-xl">
            <div className="flex -space-x-4 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                alt="image"
                className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-1"
              />
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                alt="image"
                className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[2]"
              />
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                alt="image"
                className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[3]"
              />
              <div className="flex items-center justify-center text-xs text-white size-9 rounded-full border-[3px] border-white bg-indigo-600 hover:-translate-y-1 transition z-[4]"></div>
            </div>
            <a
              href="/404.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Join us as a counsellor
            </a>
          </div>
        </div>
        <div className="text-sm text-slate-600 max-w-lg">
          <h1 className="text-xl uppercase font-semibold text-slate-700">What we do?</h1>
          <div className="w-24 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 to-[#DDD9FF]"></div>
          <p className="mt-8">
            We provide confidential, professional, and empathetic counseling to individuals and families facing personal, emotional, or legal-related challenges
          </p>
          <p className="mt-4">
            Our counseling services are designed to help clients understand their situation clearly, manage stress, and make informed decisions with confidence. We connect you with trained and experienced counselors who listen without judgment and offer practical guidance tailored to your needs.
          </p>
          <p className="mt-4">
            Whether you are dealing with marital issues, domestic concerns, workplace stress, trauma, or emotional distress arising from legal disputes, we ensure a safe and supportive environment. Our approach focuses on emotional well-being, clarity of thought, and empowerment, helping you regain control, build resilience, and move forward with dignity and strength while maintaining complete privacy and trust.
          </p>
          <a
            href="#"
            className="flex items-center w-max gap-2 mt-8 hover:-translate-y-0.5 transition bg-gradient-to-r from-indigo-600 to-[#8A7DFF] py-3 px-8 rounded-full text-white"
          >
            <span>Read more</span>
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.53 6.53a.75.75 0 0 0 0-1.06L7.757.697a.75.75 0 1 0-1.06 1.06L10.939 6l-4.242 4.243a.75.75 0 0 0 1.06 1.06zM0 6v.75h12v-1.5H0z"
                fill="#fff"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* ── TYPES OF COUNSELLING ── */}
      <section className="w-full bg-[#fbfbf6] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-black">Types of Counselling We Provide</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Safe, private and judgement-free sessions to help you feel lighter, clearer, and more in control.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
            {counsellingTypes.map(({ emoji, title, desc }) => (
              <div className="text-center" key={title}>
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-lg bg-white border border-blue-200 text-xl">
                  {emoji}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER IMAGE ── */}
      <img
        src="/img/ChatGPT Image Jan 25, 2026, 02_39_37 AM.png"
        alt=""
        className="w-[95%] mx-auto h-[180px] md:h-[650px] object-cover rounded-2xl"
      />

      {/* ── FAQ ── */}
      <div className="w-full flex flex-col items-center text-center px-4 py-10 overflow-visible">
        <p className="text-base font-medium text-slate-600">FAQ</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-500 mt-4 max-w-sm">
          Proactively answering FAQs boosts user confidence and cuts down on support tickets.
        </p>

        <div className="w-[95%] mx-auto mt-6 flex flex-col gap-4 items-start text-left">
          {faqsData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div className="faq-item flex flex-col items-start w-full" key={index}>
                <div
                  className="faq-header flex items-center justify-between w-full cursor-pointer bg-slate-50 border border-slate-200 p-4 rounded transition-all"
                  onClick={() => toggleFaq(index)}
                >
                  <h2 className="text-sm">{faq.question}</h2>
                  <svg
                    className={`faq-icon transition-all duration-500 ease-in-out ${isOpen ? "rotate-180" : ""}`}
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                      stroke="#1D293D"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className={`faq-answer text-sm text-slate-500 px-4 overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"
                  }`}
                >
                  {faq.answer}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}