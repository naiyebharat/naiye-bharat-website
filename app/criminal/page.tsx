"use client";
import { useState } from "react";

const faqs = [
  {
    question: "Can I represent myself in a civil court (Party-in-Person)?",
    answer:
      'Yes, under Indian law, you have the right to represent your own case without a lawyer. This is known as appearing as a "Party-in-Person." However, civil procedure (CPC) is highly technical, and a lack of procedural knowledge can weaken your case, so legal counsel is generally advised.',
  },
  {
    question: " How long does a civil case take to resolve in India?",
    answer:
      'This is the most common concern. While timelines vary greatly by state and court caseload, civil litigation in India is known to be lengthy, often taking 3 to 5 years or more for a final judgment in lower courts. However, distinct tracks like "Commercial Courts" are now faster.',
  },
  {
    question: "What is the main difference between a civil and a criminal case?",
    answer:
      "In a criminal case, the state prosecutes a person for a crime (like theft or assault), and the result is usually punishment (jail or fine). In a civil case, it is a dispute between private parties (individuals or organizations) over rights or obligations. The goal is usually compensation (damages) or a specific order to do (or stop doing) something, rather than punishment.",
  },
  {
    question: ' Is sending a "Legal Notice" mandatory before filing a court case?',
    answer:
      "In many civil cases, yes. A Legal Notice is a formal warning sent to the opposing party giving them a final chance to resolve the dispute (e.g., pay money owed or vacate a property) within a specific timeframe. If they fail to comply, you can use the proof of this notice to file a formal suit in court.",
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
        className="flex flex-col items-center pb-48 text-center text-sm text-white max-md:px-2 bg-[url('/img/court.jpg')] bg-cover bg-center"
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
          <p className="-translate-x-2">
            reviews: We rely on preparation, strategy, and results not promises
          </p>
        </div>

        <h1 className="font-berkshire text-[45px]/[52px] md:text-6xl/[65px] mt-6 max-w-4xl">
          Strategic Civil Defense You Can Trust
        </h1>

        <p className="text-base mt-2 max-w-xl">
          Confidential civil law consultation to understand charges, risks, and next steps.
        </p>

        <p className="text-base mt-3 md:mt-7 max-w-xl">
          Strategic legal guidance for bail, FIR, investigation, and strong courtroom defense
        </p>
      </section>

      {/* ── ABOUT CIVIL LAW ── */}
      <section className="bg-white text-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-berkshire">About Civil Law</h2>

          <p className="w-full text-xl text-gray-700">
            Civil law deals with disputes between individuals, families, or businesses related to rights, property,
            money, and legal responsibilities. It includes matters like property disputes, contract breaches,
            recovery of dues, landlord-tenant issues, legal notices, consumer complaints, and civil suits.
          </p>
        </div>

        <div className="w-full px-4 md:px-12 pt-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-start">
          {/* Left */}
          <div className="text-left mb-6">
            <h2 className="text-4xl font-bold mb-4 font-berkshire">What we&apos;ll do!</h2>

            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              In our civil law consultation service, we first understand your complete situation and check all documents,
              agreements, messages, and evidence. Then we explain your legal rights, possible outcomes, timeframes,
              and the best practical approach.
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
              src="/img/0460f383-fcda-402c-b18b-b2a555f41fa0_11zon.jpg"
              alt="Law Consultation"
              className="w-full md:w-[700px] h-[240px] md:h-[360px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-24">
          <h3 className="text-3xl font-bold mb-4 font-berkshire">Why Us for Civil Disputes?</h3>

          <p className="text-xl text-gray-700 leading-relaxed">
            When your property, money, or rights are at stake, you need precise legal action.
            We offer civil law consultation with strong case analysis, document review, and strategic planning.
            From disputes and recovery to tenancy and contracts, we guide you legally and practically,
            ensuring correct steps at the right time.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center">
          <p className="text-indigo-600 text-sm font-medium">FAQ&apos;s</p>
          <h1 className="text-3xl font-semibold text-center">Looking for answer?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4 text-center">
            Authoritative guidance on civil disputes, legal procedures, and resolution strategies.
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