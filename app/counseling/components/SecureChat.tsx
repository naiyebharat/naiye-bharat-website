// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, RefreshCw, Lock, Scale, ShieldCheck } from "lucide-react";
import axios from "axios";

interface Message {
  _id: string;
  roomId: string;
  senderType: "client" | "expert" | "system";
  senderName: string;
  text: string;
  createdAt: string;
}

interface SecureChatProps {
  orderId: string | null;
  roomId: string | null;
  onReset: () => void;
}

export default function SecureChat({ orderId, roomId, onReset }: SecureChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from DB
  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const res = await axios.get(`/api/chat/messages?roomId=${roomId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Message fetch error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load + polling every 5 seconds for new messages
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [roomId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !roomId || sending) return;

    try {
      setSending(true);
      await axios.post("/api/chat/messages", {
        roomId,
        text: inputMessage.trim(),
        senderType: "client",
        senderName: "Client",
      });
      setInputMessage("");
      await fetchMessages(); // Immediately refresh after send
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen w-full bg-slate-50 dark:bg-[#050b1d] py-6 px-6 lg:px-12 flex flex-col"
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-6">

        {/* BRANDING */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-[#00c2a8] flex items-center justify-center shadow-lg">
              <Scale className="w-4 h-4 text-white dark:text-[#050b1d]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Naiye<span className="text-amber-600 dark:text-[#00c2a8]">Bharat</span>
            </span>
          </div>
          <button
            onClick={onReset}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition cursor-pointer px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Terminate Session
          </button>
        </div>

        {/* Meta Bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <Lock className="w-4 h-4 text-emerald-600 dark:text-[#00c2a8]" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">Confidential Channel — Live</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-[#00c2a8]" />
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-[#00c2a8] uppercase tracking-wider">E2E Secured</span>
          </div>
        </div>

        {/* FULL CHAT PANEL */}
        <div className="flex-1 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col shadow-xl overflow-hidden" style={{ minHeight: "520px" }}>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Initializing Secure Channel...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Lock className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-semibold text-slate-400">No messages yet. Start the conversation.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderType === "client" ? "justify-end" : "justify-start"}`}
                >
                  {msg.senderType !== "client" && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300 flex-shrink-0 mr-2 mt-0.5">
                      {msg.senderType === "system" ? "🤖" : msg.senderName?.[0]?.toUpperCase() || "E"}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 max-w-xl">
                    {msg.senderType !== "client" && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                        {msg.senderType === "system" ? "NaiyeBharat Bot" : msg.senderName}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                        msg.senderType === "client"
                          ? "bg-emerald-600 text-white dark:bg-[#00c2a8] dark:text-[#050b1d] font-bold rounded-tr-none"
                          : msg.senderType === "system"
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/20 rounded-tl-none text-center"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className={`text-[9px] text-slate-400 ${msg.senderType === "client" ? "text-right" : "ml-1"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex gap-3 bg-white dark:bg-[#0b1329]"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={sending}
              className="flex-1 bg-slate-50 dark:bg-[#050b1d] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-5 bg-emerald-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] rounded-xl hover:opacity-90 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white dark:border-[#050b1d] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
}