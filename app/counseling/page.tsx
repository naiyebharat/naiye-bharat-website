// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import IntakeForm from "./components/IntakeForm";
import ExpertMatches from "./components/ExpertMatches";
import SecureChat from "./components/SecureChat";
import { ArrowLeft } from "lucide-react";

type MatchCriteria = {
  specialty: string;
  language: string;
};

export default function CounselingPage() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    const savedOrderId = localStorage.getItem("current_active_order_id");
    const savedMatchCriteria = localStorage.getItem("current_match_criteria");
    const savedRoomId = localStorage.getItem("current_active_room_id");
    const savedStep = localStorage.getItem("current_active_step");

    if (savedStep) {
      setCurrentOrderId(savedOrderId);
      setActiveStep(Number(savedStep) as 1 | 2 | 3);
    }

    if (savedRoomId) {
      setActiveRoomId(savedRoomId);
    }

    if (savedMatchCriteria) {
      try {
        setMatchCriteria(JSON.parse(savedMatchCriteria));
      } catch {
        localStorage.removeItem("current_match_criteria");
      }
    }
  }, []);

  const handleStepTransition = (
    step: 1 | 2 | 3,
    orderId: string | null,
    roomId: string | null = null,
    criteria: MatchCriteria | null = null,
  ) => {
    setActiveStep(step);
    setCurrentOrderId(orderId);
    setActiveRoomId(roomId);
    setMatchCriteria(criteria);

    if (orderId) {
      localStorage.setItem("current_active_order_id", orderId);
    } else {
      localStorage.removeItem("current_active_order_id");
    }

    if (step === 2 || step === 3) {
      localStorage.setItem("current_active_step", String(step));
    } else {
      localStorage.removeItem("current_active_step");
    }

    if (criteria) {
      localStorage.setItem("current_match_criteria", JSON.stringify(criteria));
    } else {
      localStorage.removeItem("current_match_criteria");
    }

    if (roomId) {
      localStorage.setItem("current_active_room_id", roomId);
    } else {
      localStorage.removeItem("current_active_room_id");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050b1d] transition-colors duration-300">

      {/* Back Button — normal flow, not absolute */}
      {activeStep !== 3 && (
        <div className="px-6 pt-6">
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b1329] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md transition-all cursor-pointer hover:-translate-x-1 duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-[#00c2a8]" />
            <span className="uppercase tracking-wider">Back to Home</span>
          </button>
        </div>
      )}

      {activeStep === 1 && (
        <IntakeForm
          onSuccess={(orderId, criteria) => handleStepTransition(2, orderId, null, criteria)}
        />
      )}

      {activeStep === 2 && (
        <ExpertMatches
          orderId={currentOrderId}
          matchCriteria={matchCriteria}
          onBack={() => handleStepTransition(1, null)}
          onUnlock={(roomId) => handleStepTransition(3, currentOrderId, roomId, matchCriteria)}
        />
      )}

      {activeStep === 3 && (
        <SecureChat
          orderId={currentOrderId}
          roomId={activeRoomId}
          onReset={() => handleStepTransition(1, null)}
        />
      )}
    </main>
  );
}