"use client";
import { useState } from "react";

const faqs = [
  {
    question: "What is the difference between a Private Limited Company and an LLP?",
    answer:
      "This is the most common question for startups deciding on their legal structure Private Limited (Pvt Ltd): Best for businesses looking to raise venture capital or give Employee Stock Options (ESOPs). It has higher compliance (audits are mandatory) but greater credibility with investors.Limited Liability Partnership (LLP): Best for small businesses or professional firms (like law or architecture firms). It has lower compliance costs (audit only required if turnover > ₹40 Lakhs or capital > ₹25 Lakhs) but cannot easily raise equity funding.",
  },
  {
    question: "What are the MoA and AoA?",
    answer:
      'Founders often ask this when drafting incorporation documents. Memorandum of Association (MoA): The "Charter" of the company. It defines the relationship between the company and the outside world. It states what the company is formed to do (its objectives).Articles of Association (AoA): The "Rulebook" of the company. It governs the internal management. It states how the company will function (rules for meetings, director powers, etc.).',
  },
  {
    question: "What are the liabilities of a Director?",
    answer:
      "This is a critical question for individuals invited to join a board.The Answer: Directors have a fiduciary duty to act in good faith.Civil Liability: They can be personally liable for negligence, breach of trust, or if they sign personal guarantees for company loans.Criminal Liability: In India, directors can face jail time for non-compliance with statutory filings, bouncing cheques (under the Negotiable Instruments Act), or fraud.",
  },
  {
    question: "Is a statutory audit mandatory for all companies?",
    answer:
      "The Answer: Yes, for Private Limited Companies.Every Private Limited Company must get its accounts audited by a Chartered Accountant every financial year, regardless of whether they made a profit or a loss.Contrast: As mentioned above, LLPs are exempt from this until they cross specific turnover thresholds",
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
        className="flex flex-col items-center pb-48 text-center text-sm text-white max-md:px-2 bg-[url('/img/Whisk_9c79f6b9f3d466e9dff4a03d7db5a066dr_11zon.jpg')] bg-cover bg-center"
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
          Strategic corporate dispute resolved with empathy and expertise
        </h1>

        <p className="text-base mt-2 max-w-xl">
          Confidential corporate law consultation to understand charges, risks, and next steps.
        </p>

        <p className="text-base mt-3 md:mt-7 max-w-xl">
          Strategic legal guidance for bail, FIR, investigation, and strong courtroom defense
        </p>
      </section>

      {/* ── ABOUT CORPORATE LAW ── */}
      <section className="bg-white text-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-berkshire">About Corporate Law</h2>

          <p className="w-full text-xl text-gray-700">
            Corporate law deals with business and company-related matters such as company registration,
            contracts, compliance, shareholder disputes, partnership issues, and legal documentation.
            These cases require a strategic and professional approach to protect business interests and
            ensure smooth operations.
          </p>
        </div>

        <div className="w-full px-4 md:px-12 pt-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-start">
          {/* Left */}
          <div className="text-left mb-6">
            <h2 className="text-4xl font-bold mb-4 font-berkshire">What we&apos;ll do!</h2>

            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              We provide legal counselling, documentation support, agreement drafting, compliance guidance,
              and connect you with experienced corporate lawyers. Our goal is to resolve disputes efficiently
              and represent your business strongly when needed.
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

          {/* Right (IMAGE FULL WIDTH ON MOBILE) */}
          <div className="w-full mb-10 md:flex md:justify-end">
            <img
              src="/img/Whisk_b424299d3f56ab1a7b1444ac77877ae5dr_11zon.jpg"
              alt="Law Consultation"
              className="w-full md:w-[700px] h-[240px] md:h-[360px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-10">
          <h3 className="text-3xl font-bold mb-4 font-berkshire">Why Us for Corporate Disputes?</h3>

          <p className="text-xl text-gray-700 leading-relaxed">
            We follow a professional and confidential approach, connect you with experienced corporate law experts,
            and focus on protecting your business interests with clear legal guidance.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center">
          <p className="text-indigo-600 text-sm font-medium">FAQ&apos;s</p>
          <h1 className="text-3xl font-semibold text-center">Looking for answer?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4 text-center">
            Authoritative guidance on corporate disputes, legal procedures, and resolution strategies.
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