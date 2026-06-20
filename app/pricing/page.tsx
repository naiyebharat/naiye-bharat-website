"use client";

import { useRouter } from "next/navigation";

export default function Pricing() {
  const router = useRouter();

  return (
    <section className="w-full px-4 py-14 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start justify-between">
        {/* LEFT CONTENT */}
        <div className="w-full lg:max-w-sm">
          <h3 className="font-domine text-3xl">OUR PRICING</h3>

          <p className="mt-4 text-sm/6 text-gray-500">
            Choose a plan that fits your needs legal support + mental health
            counselling. Every plan includes expert guidance, fast response, and
            complete confidentiality
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="p-2.5 border border-gray-200 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sparkles size-5"
                  aria-hidden="true"
                >
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                  <path d="M20 2v4" />
                  <path d="M22 4h-4" />
                  <circle cx="4" cy="20" r="2" />
                </svg>
              </div>
              <p>Legal help + mental health counselling</p>
            </div>

            <div className="flex items-center gap-3 text-gray-500">
              <div className="p-2.5 border border-gray-200 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-zap size-5"
                  aria-hidden="true"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                </svg>
              </div>
              <p>Quick response &amp; priority consultation</p>
            </div>

            <div className="flex items-center gap-3 text-gray-500">
              <div className="p-2.5 border border-gray-200 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield-check size-5"
                  aria-hidden="true"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p>Transparent pricing with full privacy</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARDS */}
        <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-10">
          {/* QUICK CONSULTATION PLAN */}
          <div className="group w-full lg:w-[360px] rounded-xl p-6 pb-10 bg-white border border-slate-200">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold">Quick consultation</h3>
              <p className="text-gray-500">
                a platform fee to connect you with a legal expert
              </p>

              <p className="mt-4 text-2xl font-semibold">
                ₹999
                <span className="text-sm font-normal text-gray-500">/session</span>
              </p>

              <button
                onClick={() => router.push("/counseling")}
                className="mt-4 w-full rounded-lg bg-gray-100 py-2.5 font-medium text-gray-800"
              >
                Get Started
              </button>
            </div>

            <div className="mt-2 flex flex-col">
              {[
                "expert consultation",
                "Case review & issue analysis",
                "Clear next-step action plan",
                "100% confidential & secure",
                "Document checklist support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 border-b py-3 border-gray-200"
                >
                  <div className="rounded-full p-1 bg-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check size-3 text-white"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* MENTAL HEALTH COUNSELLING PLAN */}
          <div className="group w-full lg:w-[360px] rounded-xl p-6 pb-10 bg-gray-800 text-white">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold">Mental health councelling</h3>
              <p className="text-gray-400">
                platform fee to connect you with best mental health counsellor
              </p>

              <p className="mt-4 text-2xl font-semibold">
                ₹999
                <span className="text-sm font-normal text-gray-400">/session</span>
              </p>

              <button
                onClick={() => router.push("/counseling")}
                className="mt-4 w-full rounded-lg bg-gray-100 py-2.5 font-medium text-gray-800 transition hover:opacity-90"
              >
                Get Started
              </button>
            </div>

            <div className="mt-2 flex flex-col">
              {[
                "1-on-1 private counselling session",
                "Stress, anxiety & emotional support",
                "Relationship & family counselling",
                "Trauma recovery & confidence building",
                "Flexible online appointment slots",
                "100% confidential & secure support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 border-b py-3 border-gray-700"
                >
                  <div className="rounded-full p-1 bg-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check size-3 text-white"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}