"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, MapPin, MessageSquare, Send, Shield, X, Zap } from "lucide-react";
import ZegoCallWidget from "@/components/ZegoCallWidget";
import { getSpecialistName } from "../utils";

export interface ClientSOSRequest {
  id: string;
  emergencyType: string;
  status: "pending" | "accepted" | "en_route" | "arrived" | "completed" | "cancelled";
  amountPaid: number;
  payout: number;
  eta?: string;
  paymentReleased?: boolean;
  paymentId?: string;
  clientLocation?: {
    coordinates?: number[];
  } | null;
  lawyer?: {
    id: string;
    name: string;
    phoneNumber?: string;
    specialty?: string;
    experience?: number;
    avatar?: string;
    currentLocation?: {
      coordinates?: number[];
    } | null;
  } | null;
  createdAt?: string;
}

export interface SOSMessageData {
  id: string;
  senderType: "client" | "expert" | "system";
  senderName: string;
  text: string;
  createdAt: string;
}

interface SOSPanelProps {
  requests: ClientSOSRequest[];
  activeSosId: string | null;
  messages: SOSMessageData[];
  loading: boolean;
  user: {
    id: string;
    name: string;
    role: "client";
  } | null;
  onSelect: (id: string) => void;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

const statusLabel: Record<ClientSOSRequest["status"], string> = {
  pending: "Finding Counsel",
  accepted: "Counsel Assigned",
  en_route: "Advocate En Route",
  arrived: "Advocate Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
};

const activeStatuses = ["pending", "accepted", "en_route", "arrived"];

export default function SOSPanel({ requests, activeSosId, messages, loading, user, onSelect, onSendMessage, onClose }: SOSPanelProps) {
  const [inputText, setInputText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const activeSOS = requests.find((item) => item.id === activeSosId) || null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSosId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text || !activeSOS) return;
    onSendMessage(text);
    setInputText("");
  };

  return (
    <div className="flex-1 flex min-h-0 bg-slate-50 dark:bg-[#050b1d]">
      <aside className={`w-full md:w-[320px] lg:w-[360px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050b1d] flex-col h-full flex-shrink-0 ${
        activeSOS ? "hidden md:flex" : "flex"
      }`}>
        <div className="p-4 border-b border-slate-300 dark:border-slate-800/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">SOS Requests</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-widest uppercase">Emergency Pipeline</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-800/60">
              {loading ? "..." : `${requests.length} Total`}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-premium">
          {requests.length === 0 ? (
            <div className="text-center py-10 text-xs font-bold text-slate-500 uppercase tracking-wide">
              No SOS requests found.
            </div>
          ) : (
            requests.map((item) => {
              const isActive = item.id === activeSosId;
              const isLive = activeStatuses.includes(item.status);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative group ${
                    isActive
                      ? "bg-red-50 dark:bg-red-950/10 border-red-500 shadow-lg shadow-red-500/5"
                      : "bg-white dark:bg-[#0b1329]/40 border-slate-300 dark:border-slate-800/60 hover:border-red-400 dark:hover:border-red-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.emergencyType}</h4>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide ${
                          isLive
                            ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 truncate">
                        {item.lawyer ? getSpecialistName(item.lawyer.id) : "Waiting for advocate acceptance"}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }).toLowerCase() : ""}
                        </span>
                        <span>Rs {item.amountPaid}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {!activeSOS ? (
        <div className="hidden md:flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/30 rounded-3xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-wide uppercase">No SOS Selected</h3>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto mt-2">
              Select an SOS request to track advocate assignment, journey status, and emergency messages.
            </p>
          </div>
        </div>
      ) : (
        <section className="flex-1 flex flex-col min-w-0 h-full">
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider truncate">{activeSOS.emergencyType}</h4>
                <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest truncate">{statusLabel[activeSOS.status]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeSOS.lawyer && activeSOS.status !== "completed" && activeSOS.status !== "cancelled" && (
                <ZegoCallWidget
                  sosId={activeSOS.id}
                  user={user}
                  peerLabel={getSpecialistName(activeSOS.lawyer.id)}
                  compact
                />
              )}
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
              >
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</div>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">{statusLabel[activeSOS.status]}</div>
            </div>
             <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Advocate</div>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white truncate">
                {activeSOS.lawyer ? getSpecialistName(activeSOS.lawyer.id) : "Not assigned yet"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">ETA / Payment</div>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">{activeSOS.eta || "Calculating"} · Rs {activeSOS.amountPaid}</div>
            </div>
          </div>

          {activeSOS.lawyer && (
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {activeSOS.lawyer.specialty || "Verified Advocate"}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Live tracking active</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-premium">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-xs font-bold text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                Emergency chat will appear here once messages start.
              </div>
            ) : (
              messages.map((msg) => {
                const isClient = msg.senderType === "client";
                const isSystem = msg.senderType === "system";
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="bg-slate-200 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full">
                        {msg.text}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex w-full ${isClient ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl shadow-sm ${
                      isClient
                        ? "bg-red-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                    }`}>
                      <span className="block text-[8px] font-extrabold uppercase tracking-wider mb-1 opacity-60">
                        {isClient ? "Client" : (activeSOS.lawyer ? getSpecialistName(activeSOS.lawyer.id) : "Naiye Bharat Specialist")}
                      </span>
                      <p className="text-xs font-medium leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                      <div className="mt-1.5 text-[9px] font-semibold opacity-70 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }).toLowerCase()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {activeSOS.status !== "completed" && activeSOS.status !== "cancelled" ? (
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-[#0b1329] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="Type emergency message..."
                className="flex-1 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-100 dark:bg-[#0b1329]/20 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              This SOS emergency has been marked as resolved. Chat and calling features are closed.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
