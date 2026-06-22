"use client";

import React from "react";

interface LawyerVerificationRegisterProps {
  lawyers: any[];
  setVerifyTarget: (target: { id: string; currentStatus: boolean; name: string }) => void;
}

export default function LawyerVerificationRegister({
  lawyers,
  setVerifyTarget,
}: LawyerVerificationRegisterProps) {
  return (
    <div className="bg-white dark:bg-[#0c142b] border border-slate-200 dark:border-slate-850 rounded-[30px] p-6 shadow-sm space-y-6">
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500">Lawyer SOS Verification Register</h3>
        <p className="text-xs text-slate-400 mt-1">Approve or revoke verification keys for lawyers, qualifying them to access real-time dispatch feeds.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-[#0c142b] z-10">
            <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th className="pb-3 pt-1">Advocate Name</th>
              <th className="pb-3 pt-1">Email / Phone</th>
              <th className="pb-3 pt-1">Specialty / Experience</th>
              <th className="pb-3 pt-1 text-center">SOS Status</th>
              <th className="pb-3 pt-1 text-right">Emergency Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
            {lawyers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  No advocates registered in network.
                </td>
              </tr>
            ) : (
              lawyers.map((lawyer) => (
                <tr key={lawyer._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 font-extrabold text-slate-900 dark:text-white leading-tight">
                    {lawyer.name}
                  </td>
                  <td className="py-3.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[150px]">
                    <div>{lawyer.email}</div>
                    <div className="mt-0.5">{lawyer.phoneNumber}</div>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-300">
                    <div>{lawyer.specialty}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 font-medium">{lawyer.experience} yrs exp</div>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block ${
                      lawyer.sosStatus === "available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-400"
                        : lawyer.sosStatus === "busy"
                        ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-500"
                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                    }`}>
                      {lawyer.sosStatus || "offline"}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setVerifyTarget({ id: lawyer._id, currentStatus: lawyer.isVerifiedSOS, name: lawyer.name })}
                      className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all border ${
                        lawyer.isVerifiedSOS
                          ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-800/40"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {lawyer.isVerifiedSOS ? "Verified" : "Unverified"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
