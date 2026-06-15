"use client";
import { useState } from "react";

const faqs = [
  {
    question: "How to verify property documents?",
    answer:
      "We help you verify property documents by checking the title, ownership records, and legal status of the property. This ensures that the documents are authentic and legally valid.",
  },
  {
    question: "What if property is disputed?",
    answer:
      "If your property is disputed, we assist in resolving the issue through legal procedures, including filing cases in court or mediation. Our experts guide you through each step to protect your rights.",
  },
  {
    question: "How long do cases take?",
    answer:
      "The duration of property cases varies depending on the complexity and court schedule. We provide regular updates and help you understand the timeline for your specific case.",
  },
  {
    question: "* What are consultation fees?",
    answer:
      "Our consultation fees are fixed and transparent. You can discuss the fee structure during your initial consultation, ensuring no hidden costs.",
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
        @import url('https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }

        .font-berkshire {
          font-family: 'Berkshire Swash', cursive;
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="flex flex-col items-center pb-48 text-center text-sm text-white max-md:px-2 bg-[url('/img/housing-disputes.webp')] bg-cover bg-center"
      >
        <div className="flex flex-wrap items-center justify-center p-1.5 mt-24 md:mt-28 rounded-full border border-slate-400 text-xs">
          <div className="flex items-center">
            <img
              className="size-7 rounded-full border-3 border-white"
              src="/img/WhatsAppImage2026-01-24at4.33.38PM.jpeg"
              alt="userImage1"
            />
            <img
              className="size-7 rounded-full border-3 border-white -translate-x-2"
              src="/img/WhatsAppImage2026-01-24at4.42.58PM.jpeg"
              alt="userImage2"
            />
            <img
              className="size-7 rounded-full border-3 border-white -translate-x-4"
              src="/img/WhatsAppImage2026-01-24at4.25.04PM.jpeg"
              alt="userImage3"
            />
          </div>
          <p className="-translate-x-2 text-black-600">
            reviews: We rely on preparation, strategy, and results not promises
          </p>
        </div>

        <h1 className="font-berkshire text-[45px]/[52px] md:text-6xl/[65px] mt-6 max-w-4xl">
          Strategic property dispute resolved with empathy and expertise
        </h1>

        <p className="text-base mt-2 max-w-xl">
          Confidential corporate law consultation to understand charges, risks, and next steps.
        </p>

        <p className="text-base mt-3 md:mt-7 max-w-xl">
          Strategic legal guidance for bail, FIR, investigation, and strong courtroom defense
        </p>
      </section>

      {/* ── ABOUT PROPERTY LAW ── */}
      <section className="bg-white text-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-berkshire">About Property Law</h2>

          <p className="w-full text-xl text-gray-700">
            Property law deals with legal issues related to land, houses, flats, and real estate. It includes ownership disputes,
            illegal possession, property verification, sale deeds, inheritance claims, and builder disputes. Clear legal guidance
            is crucial to avoid fraud and long-term conflicts.
          </p>
        </div>

        <div className="w-full px-4 md:px-12 pt-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-start">
          {/* Left */}
          <div className="text-left mb-6">
            <h2 className="text-4xl font-bold mb-4 font-berkshire">What we&apos;ll do!</h2>

            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              We assist with property document verification, legal opinions, dispute resolution, drafting agreements,
              and connecting you with expert property lawyers. We also help track cases and guide you through court procedures.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-2">
              • We guide you on whether the matter should be settled through negotiation, sent as a legal notice, or filed in court
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-2">
              • Our goal is to protect your interests, avoid unnecessary delays, and help you take the correct legal step with confidence
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-2">
              • If required, we also assist in drafting notices, preparing case files, and representing you in court proceedings.
            </p>
          </div>

          {/* Right (FULL WIDTH ON MOBILE) */}
          <div className="w-full mb-10 md:flex md:justify-end">
            <img
              src="/img/What-is-part-performance-in-property-law-f_11zon.jpg"
              alt="Law Consultation"
              className="w-full md:w-[700px] h-[240px] md:h-[360px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-24">
          <h3 className="text-3xl font-bold mb-4 font-berkshire">Why Us for Property Disputes?</h3>

          <p className="text-xl text-gray-700 leading-relaxed">
            Trusted legal experts, transparent advice, and complete support from verification to resolution
            make us reliable for property matters.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center">
          <p className="text-indigo-600 text-sm font-medium">FAQ&apos;s</p>
          <h1 className="text-3xl font-semibold text-center">Looking for answer?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4 text-center">
            Authoritative guidance on property disputes, legal procedures, and resolution strategies.
          </p>

          <div className="w-full">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border-b border-slate-200 py-4 cursor-pointer w-full"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">{faq.question}</h3>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-all duration-500 ease-in-out icon ${isOpen ? "rotate-180" : ""}`}
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
                    className={`text-sm text-slate-500 transition-all duration-500 ease-in-out w-full max-w-none answer ${
                      isOpen
                        ? "opacity-100 max-h-[300px] translate-y-0 pt-4"
                        : "opacity-0 max-h-0 -translate-y-2 pt-0"
                    }`}
                  >
                    {faq.answer}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}