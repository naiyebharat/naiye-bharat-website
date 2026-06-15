"use client";
import { useState } from "react";

const faqs = [
  {
    question: "Can a daughter claim a share in her father's property?",
    answer:
      "Yes, under the Hindu Succession Act, 1956, a daughter has equal rights as a son to inherit her father's property. This applies to both ancestral and self-acquired property. The amendment made in 2005 further strengthened the rights of daughters, ensuring they are treated equally in matters of inheritance.",
  },
  {
    question: "How can I check if a property is under legal dispute before buying?",
    answer:
      "To check if a property is under legal dispute, you can conduct a title search at the local sub-registrar's office where the property is registered. Additionally, you can check court records for any ongoing litigation related to the property. It is also advisable to consult with a legal expert who can help you verify the property's status and ensure there are no encumbrances or disputes associated with it.",
  },
  {
    question: "Can a tenant claim ownership if they stay for 12 years?",
    answer:
      "In India, a tenant cannot automatically claim ownership of a property just by staying for 12 years. However, under certain circumstances, such as a tenancy agreement or specific legal provisions, a tenant may have rights to continue occupying the property. It is advisable to consult with a legal expert for specific situations.",
  },
  {
    question: "How do I divide a joint property if other co-owners disagree?",
    answer:
      "If co-owners disagree on dividing a joint property, you can file a partition suit in the civil court. The court will evaluate the situation and may order a physical division of the property or a sale of the property with proceeds divided among the co-owners. It is advisable to seek legal counsel to navigate this process effectively.",
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
        className="flex flex-col items-center pb-48 text-center text-sm text-white max-md:px-2 bg-[url('/img/fcb5b13f-69ac-4c07-bbf0-24f078808d8a_11zon.jpg')] bg-cover bg-center"
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
          Strategic family dispute resolved with empathy and expertise
        </h1>

        <p className="text-base mt-2 max-w-xl">
          Confidential family law consultation to understand charges, risks, and next steps.
        </p>

        <p className="text-base mt-3 md:mt-7 max-w-xl">
          Strategic legal guidance for bail, FIR, investigation, and strong courtroom defense
        </p>
      </section>

      {/* ── ABOUT FAMILY LAW ── */}
      <section className="bg-white text-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-berkshire">About Family Law</h2>

          <p className="w-full text-xl text-gray-700">
            Family law deals with domestic disputes such as divorce, alimony, child custody, adoption, and domestic
            violence. These cases often involve emotional complexities and require a compassionate yet strategic approach.
            Family law aims to protect the rights of all parties involved, especially children, while ensuring fair resolutions.
          </p>
        </div>

        <div className="w-full px-4 md:px-12 pt-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-start">
          {/* Left */}
          <div className="text-left mb-6">
            <h2 className="text-4xl font-bold mb-4 font-berkshire">What we&apos;ll do!</h2>

            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              We provide legal counseling, mediation support, documentation assistance, and lawyer connections.
              Our aim is to resolve disputes peacefully where possible and represent you strongly in court when required.
              We ensure privacy, clarity, and step-by-step guidance.
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
              src="/img/Whisk_7f9f485fb298576b6804c92411cd9d99dr_11zon.jpg"
              alt="Law Consultation"
              className="w-full md:w-[700px] h-[240px] md:h-[360px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-24">
          <h3 className="text-3xl font-bold mb-4 font-berkshire">Why Us for Family Disputes?</h3>

          <p className="text-xl text-gray-700 leading-relaxed">
            We follow an empathetic and confidential approach, connect you with experienced family law experts,
            and prioritize your emotional and legal well-being.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center">
          <p className="text-indigo-600 text-sm font-medium">FAQ&apos;s</p>
          <h1 className="text-3xl font-semibold text-center">Looking for answer?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4 text-center">
            Authoritative guidance on family disputes, legal procedures, and resolution strategies.
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