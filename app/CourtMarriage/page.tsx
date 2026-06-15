"use client";
import { useState } from "react";

const faqs = [
  {
    question: "What documents are required for court marriage?",
    answer:
      "Both parties need valid identity and address proof such as Aadhaar Card, Passport, Voter ID, or Driving License. Age proof (Birth Certificate, 10th Marksheet, or Passport), passport-size photographs, and proof of marital status (divorce decree or death certificate if previously married) are required. Three witnesses with valid ID proof are also needed.",
  },
  {
    question: "How long does the court marriage process take?",
    answer:
      "Under the Special Marriage Act, the process usually takes 30–45 days due to the mandatory notice period. In some cases, depending on documentation and jurisdiction, the timeline may vary. Our team helps ensure the process is completed without unnecessary delays.",
  },
  {
    question: "Can court marriage be done online or with one visit?",
    answer:
      "Certain steps such as form filling and appointment booking can be done online. However, physical presence before the Marriage Registrar is mandatory on the day of notice and on the day of marriage for verification and solemnization. Complete online court marriage is not legally permitted in India.",
  },
  {
    question: "What are the legal and consultation fees?",
    answer:
      "Government court marriage fees are minimal and fixed by law. Legal and consultation fees depend on documentation support, guidance, and representation required. We offer transparent and affordable packages, which are shared upfront—no hidden charges.",
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
        className="flex flex-col items-center pb-48 text-center text-sm text-white max-md:px-2 bg-[url('/img/Gemini_Generated_Image_qaxzoaqaxzoaqax.jpeg')] bg-cover bg-center"
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
          Strategic family court marriage with empathy and expertise
        </h1>

        <p className="text-base mt-2 max-w-xl">
          marriage law consultation to understand charges, risks, and next steps.
        </p>

        <p className="text-base mt-3 md:mt-7 max-w-xl">
          Strategic legal guidance for bail, FIR, investigation, and strong courtroom defense
        </p>
      </section>

      {/* ── ABOUT MARRIAGE LAWS ── */}
      <section className="bg-white text-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-berkshire">About marriage Laws</h2>
          <p className="w-full text-xl text-black-600">
            Court marriage is a legal process under the Special Marriage Act, 1954, that allows two individuals to marry without religious ceremonies. It ensures legal recognition of marriage irrespective of caste, religion, or nationality. Court marriage covers notice of intended marriage, document verification, witness requirements, solemnization before a marriage officer, and issuance of a legal marriage certificate, ensuring transparency and legal validity.
          </p>
        </div>

        <div className="w-full px-12 pt-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-start">
          {/* Left */}
          <div className="text-left mb-6">
            <h2 className="text-4xl font-bold mb-4 font-berkshire">What we&apos;ll do!</h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              We assist you with complete court marriage procedures including document preparation, notice filing, eligibility verification, appointment scheduling, witness guidance, and marriage certificate issuance. Our team connects you with experienced legal professionals who guide you at every step, provide legal clarity, and ensure smooth coordination with the marriage registrar. We also offer proper case tracking so you stay informed throughout the process.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed">
              • We guide you on whether the matter should be settled through negotiation, sent as a legal notice, or filed in court
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              •Our goal is to protect your interests, avoid unnecessary delays, and help you take the correct legal step with confidence
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              • If required, we also assist in drafting notices, preparing case files, and representing you in court proceedings.
            </p>
          </div>

          {/* Right */}
          <div className="flex justify-end mb-10">
            <img
              src="/img/Court-Marriage_11zon.webp"
              alt="Law Consultation"
              className="w-[700px] h-[360px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="mb-24">
          <h3 className="text-3xl font-bold mb-4 font-berkshire">Why Us for Court Marriage?</h3>
          <p className="text-xl text-gray-700 leading-relaxed mb-30">
            We provide clear legal guidance, affordable consultation, verified legal experts, and end-to-end support. Our focus is on a hassle-free, confidential, and legally compliant court marriage process with timely updates and transparency.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center">
          <p className="text-indigo-600 text-sm font-medium">FAQ&apos;s</p>
          <h1 className="text-3xl font-semibold text-center">Looking for answer?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4 text-center">
            Authoritative guidance on court marriage disputes, legal procedures, and resolution strategies.
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