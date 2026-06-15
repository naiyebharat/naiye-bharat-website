// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, X, CheckCircle2, Loader2 } from "lucide-react";
import { ClientRequest } from "./RequestList";
import axios from "axios";

interface ChatAreaProps {
  activeClient: ClientRequest | null;
  onCloseChat: () => void;
  triggerToast: (title: string, message: string, type: "success" | "error" | "info") => void;
}

interface MessageNode {
  _id?: string;
  senderType: "client" | "expert" | "system";
  senderName: string;
  text: string;
  createdAt?: string;
  time?: string;
}

const POLL_INTERVAL = 5000;

export default function ChatArea({ activeClient, onCloseChat, triggerToast }: ChatAreaProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages for active room
  const fetchMessages = async (roomId: string) => {
    try {
      const res = await axios.get(`/api/chat/messages?roomId=${roomId}`);
      if (res.data.success) {
        // API returns `messages` key (not `data`)
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error("Message fetch error:", err);
    }
  };

  // On client change: load messages + start polling
  useEffect(() => {
    if (!activeClient?.roomId) {
      setMessages([]);
      return;
    }

    setLoadingMsgs(true);
    fetchMessages(activeClient.roomId).finally(() => setLoadingMsgs(false));

    // Poll every 5s
    pollRef.current = setInterval(() => {
      fetchMessages(activeClient.roomId);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeClient?.roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = typedMessage.trim();
    if (!text || !activeClient?.roomId || sending) return;

    setSending(true);
    setTypedMessage("");

    // Optimistic UI — show immediately, next poll will sync with DB
    const optimistic: MessageNode = {
      senderType: "expert",
      senderName: "Advocate",
      text,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await axios.post("/api/chat/messages", {
        roomId: activeClient.roomId,
        senderType: "expert",
        senderName: "Advocate",
        text,
      });
      // After successful save, refetch to get the real DB message (with _id, createdAt)
      // Small delay ensures DB has committed the write
      setTimeout(() => fetchMessages(activeClient.roomId), 300);
      triggerToast("Message Sent", "Your reply has been delivered securely.", "success");
    } catch (err: any) {
      triggerToast("Send Failed", err.response?.data?.error || "Could not send message.", "error");
      // Revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      setTypedMessage(text); // restore text
    } finally {
      setSending(false);
    }
  };

  // Empty state
  if (!activeClient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-[#050b1d] h-full select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-[#0b1329] flex items-center justify-center text-slate-400 dark:text-[#00c2a8] mb-4 border border-slate-300/40 dark:border-slate-800">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">No Active Session</h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Select a client from the left panel to start a secure consultation session.
          </p>
        </motion.div>
      </div>
    );
  }

  const formatTime = (msg: MessageNode) => {
    if (msg.time) return msg.time;
    if (msg.createdAt) return new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return "";
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#050b1d] h-full">
      {/* Chat Header */}
      <div className="p-4 bg-white dark:bg-[#050b1d] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-[#00c2a8] flex items-center justify-center font-black text-white dark:text-[#050b1d] text-sm">
            {activeClient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeClient.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-[#00c2a8] flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#00c2a8] animate-pulse" />
              Secure Session Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className="hidden md:block text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#0b1329] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            {activeClient.issue?.slice(0, 30)}{activeClient.issue?.length > 30 ? "..." : ""}
          </span>
          <button
            onClick={onCloseChat}
            className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
          >
            <X className="w-4 h-4" />
            <span className="hidden md:block">Close</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingMsgs ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500 dark:text-[#00c2a8]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400 dark:text-slate-600">
            <MessageSquare className="w-8 h-8" />
            <span className="text-xs font-semibold">No messages yet. Say hello!</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAdvocate = msg.senderType === "expert";
            const isSystem = msg.senderType === "system";

            if (isSystem) {
              return (
                <div key={msg._id || idx} className="flex justify-center">
                  <span className="bg-slate-200 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700/40">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg._id || idx} className={`flex w-full ${isAdvocate ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm
                  ${isAdvocate
                    ? "bg-emerald-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] rounded-tr-none"
                    : "bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/50 rounded-tl-none"
                  }`}
                >
                  {!isAdvocate && (
                    <span className="block text-[9px] font-black text-emerald-600 dark:text-[#00c2a8] mb-1 uppercase tracking-wider">
                      {msg.senderName}
                    </span>
                  )}
                  <p>{msg.text}</p>
                  <span className={`block text-[8px] font-bold mt-1 text-right opacity-70`}>
                    {formatTime(msg)}
                    {isAdvocate && <CheckCircle2 className="w-2.5 h-2.5 inline ml-1" />}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#050b1d] border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type your legal assessment reply..."
          disabled={sending}
          className="flex-1 bg-slate-100 dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00c2a8] placeholder-slate-400 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !typedMessage.trim()}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00c2a8] dark:hover:bg-[#00ebd0] text-white dark:text-[#050b1d] rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}