"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircleCode, Check, ShieldAlert, X } from "lucide-react";
import { CaseOrder } from "./OrderList";

export interface MessageData {
  id: string;
  sender: "client" | "advocate";
  text: string;
  time: string;
}

interface ChatAreaProps {
  activeCase: CaseOrder | null;
  messages: MessageData[];
  onSendMessage: (text: string) => void;
  onCloseChat: () => void;
}

export default function ChatArea({ activeCase, messages, onSendMessage, onCloseChat }: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  // 1. Check Empty Pipeline State
  if (!activeCase) {
    return (
      // 🔥 Added 'hidden md:flex' so this placeholder doesn't take space on mobile layout
      <div className="hidden md:flex flex-1 bg-slate-50 dark:bg-[#050b1d] items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-md border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0b1329]/30 rounded-3xl p-8 text-center shadow-sm backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4">
            <MessageCircleCode className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-wide uppercase">
            No Active Session
          </h3>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto mt-2">
            Select an applied legal consultation case from the left panel to execute a secure end-to-end communication node stream.
          </p>
        </div>
      </div>
    );
  }

  // 2. Complete Live Execution Stream
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#050b1d] h-full transition-colors duration-300 relative w-full">
      {/* Session Header Area */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 sm:px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-[#00c2a8] flex items-center justify-center text-white dark:text-[#050b1d] font-black text-xs uppercase shadow-sm flex-shrink-0">
            {activeCase.advocateName.replace("Adv. ", "").substring(0, 2)}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider truncate">
              {activeCase.advocateName}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                Secure Session Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-300 dark:text-slate-800 tracking-tighter text-xs font-semibold select-none">
            ..................................................
          </div>
          <button
            onClick={onCloseChat}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
          >
            <X className="w-3.5 h-3.5" /> Close
          </button>
        </div>
      </div>

      {/* Live Token Status Alert Notification Banner */}
      <div className="p-3 bg-slate-200/50 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/50 text-center px-4">
        <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 inline-flex items-center gap-1.5 justify-center leading-normal">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-500 dark:text-[#00c2a8] flex-shrink-0" /> 
          <span className="truncate max-w-[280px] sm:max-w-none">Session security active. Messages are end-to-end encrypted.</span>
        </p>
      </div>

      {/* Messages Canvas Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-premium">
        {messages.map((msg) => {
          const isMe = msg.sender === "client";
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl relative shadow-sm ${
                isMe
                  ? "bg-emerald-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] rounded-tr-none"
                  : "bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none"
              }`}>
                <span className={`block text-[8px] font-extrabold uppercase tracking-wider mb-1 opacity-60 ${
                  isMe ? "text-right" : "text-left"
                }`}>
                  {isMe ? "Client" : "Advocate Node"}
                </span>

                <p className="text-xs font-medium leading-relaxed break-words whitespace-pre-wrap">
                  {msg.text}
                </p>

                <div className={`flex items-center gap-1 mt-1.5 justify-end text-[9px] font-semibold opacity-70 ${
                  isMe ? "text-emerald-100 dark:text-[#050b1d]/80" : "text-slate-400"
                }`}>
                  {msg.time}
                  {isMe && <Check className="w-3 h-3 text-white dark:text-[#050b1d]" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Form Submission Pipeline Input Deck */}
      <div className="p-4 bg-white dark:bg-[#0b1329] border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSendSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your legal assessment query here..."
            className="flex-1 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-0 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] dark:hover:bg-[#00ebd0] rounded-xl transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}