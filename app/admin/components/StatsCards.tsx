"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Percent,
  IndianRupee,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface StatsData {
  totalPaidOrders: number;
  totalRevenue: number;
  conversionRate: string;
}

export default function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Error fetching admin dashboard stats node:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Conversion rate parsed to float for strict dynamic threshold checking
  const currentConversion = stats ? parseFloat(stats.conversionRate) : 0;
  const isConversionLow = currentConversion < 70;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Card 1: Total Platform Revenue (Amber/Orange Ambient Glow Layer) */}
      <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden transition-all bg-gradient-to-br from-transparent to-amber-500/10">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Live Platform Revenue
            </p>
            {loading ? (
              <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-2" />
            ) : (
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-4xl font-extrabold text-emerald-600 dark:text-[#00c2a8]">
                  ₹{stats?.totalRevenue.toLocaleString("en-IN")}
                </h3>
                <span className="flex items-center text-xs font-bold text-emerald-500 dark:text-[#00c2a8]">
                  <MoveUp className="w-7 h-7" />
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100/40 dark:border-slate-800">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Card 2: Total Paid Orders (Emerald/Green Ambient Glow Layer) */}
      <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden transition-all bg-gradient-to-br from-transparent to-emerald-500/10">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Confirmed Consultations
            </p>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-2" />
            ) : (
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">
                  {stats?.totalPaidOrders}
                </h3>
                <span className="flex items-center text-xs font-bold text-emerald-500 dark:text-[#00c2a8]">
                  <MoveUp className="w-7 h-7" />
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-[#00c2a8] rounded-xl border border-emerald-100/40 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Card 3: Conversion Engine Rate (Pink/Rose Ambient Glow Layer) */}
      <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden transition-all bg-gradient-to-br from-transparent to-rose-500/10">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Payment Conversion Rate
            </p>
            {loading ? (
              <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-2" />
            ) : (
              <div className="flex items-baseline gap-2 mt-2">
                <h3
                  className={`text-4xl font-extrabold ${isConversionLow ? "text-rose-500" : "text-blue-600 dark:text-blue-400"}`}
                >
                  {stats?.conversionRate}%
                </h3>
                {isConversionLow ? (
                  <span className="flex items-center text-xs font-bold text-rose-500 animate-bounce">
                    <MoveDown className="w-7 h-7" />
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-emerald-500 dark:text-[#00c2a8]">
                    <MoveUp className="w-7 h-7" />
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100/40 dark:border-slate-800">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

    </div>
  );
}