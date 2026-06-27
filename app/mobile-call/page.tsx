"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ZegoCallWidget from "@/components/ZegoCallWidget";
import { Scale } from "lucide-react";

function MobileCallContent() {
  const searchParams = useSearchParams();
  const sosId = searchParams.get("sosId") || "";
  const userId = searchParams.get("userId") || "";
  const name = searchParams.get("name") || "User";
  const role = (searchParams.get("role") || "client") as "admin" | "advocate" | "client";
  const peerLabel = searchParams.get("peerLabel") || "Responder";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050b1d] text-slate-400">
        <Scale className="h-10 w-10 animate-pulse text-[#d4af37]" />
        <span className="mt-4 text-xs font-bold uppercase tracking-widest">Initializing...</span>
      </div>
    );
  }

  if (!sosId || !userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050b1d] p-6 text-center text-red-400">
        <span className="text-xs font-bold uppercase tracking-widest">Invalid Session Parameters</span>
        <p className="mt-2 text-[10px] text-slate-500 font-semibold uppercase">Missing sosId or userId</p>
      </div>
    );
  }

  const user = {
    id: userId,
    name: name,
    role: role,
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050b1d] p-6">
      {/* Visual Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#d4af37] bg-slate-900 shadow-xl">
          <Scale className="h-6 w-6 text-[#d4af37]" />
        </div>
        <h2 className="mt-4 text-sm font-black uppercase tracking-widest text-slate-200">
          Naiye<span className="text-[#d4af37]">Bharat</span> Lifeline
        </h2>
        <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Securing your session: {sosId.substring(0, 8)}...
        </p>
      </div>

      {/* Zego WebRTC Call Widget */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0b1329] p-6 text-center shadow-xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] block mb-4">
          Establish Audio/Video Feed
        </span>
        <div className="flex justify-center">
          <ZegoCallWidget
            sosId={sosId}
            user={user}
            peerLabel={peerLabel}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
}

export default function MobileCallPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050b1d] text-slate-400">
        <Scale className="h-10 w-10 animate-pulse text-[#d4af37]" />
        <span className="mt-4 text-xs font-bold uppercase tracking-widest">Loading...</span>
      </div>
    }>
      <MobileCallContent />
    </Suspense>
  );
}
