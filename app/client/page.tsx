"use client";

import React, { useState, useEffect } from "react";
import ProfileHeader from "./components/ProfileHeader";
import OrderList, { CaseOrder } from "./components/OrderList";
import ChatArea, { MessageData } from "./components/ChatArea";
import CaseDetailsDrawer from "./components/CaseDetails";
import Toast, { ToastData } from "../advocate/components/Toast"; 
import LogoutModal from "../advocate/components/LogoutModal";
import { AnimatePresence } from "framer-motion";

export default function ClientPortal() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [casesList, setCasesList] = useState<CaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentChatMessages, setCurrentChatMessages] = useState<MessageData[]>([]);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseOrder | null>(null);
  
  const [toast, setToast] = useState<ToastData>({
    show: false,
    title: "",
    message: "",
    type: "info"
  });
  const [clientName, setClientName] = useState<string>("Client User");

  // Fetch dynamic profile details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setClientName(data.user.name);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    }
    fetchProfile();
  }, []);

  // Theme LocalStorage Sync Engine
  useEffect(() => {
    const savedTheme = localStorage.getItem("nb_theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("nb_theme", theme);
  }, [theme]);

  // 🔄 POLLING ENGINE A: Fetch Cases Pipeline (4 Seconds Loop)
  useEffect(() => {
    async function fetchCasesPipeline() {
      try {
        const res = await fetch("/api/client/cases");
        const data = await res.json();
        if (data.success && data.cases) {
          setCasesList(data.cases);
          if (loading) {
            setLoading(false);
            if (data.cases.length > 0 && !activeCaseId) {
              setActiveCaseId(data.cases[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Pipeline Sync Error:", err);
        setLoading(false);
      }
    }

    fetchCasesPipeline();
    const casesInterval = setInterval(fetchCasesPipeline, 4000);
    return () => clearInterval(casesInterval);
  }, [loading, activeCaseId]);

  // 🔄 POLLING ENGINE B: Fetch Active Chat Messages (2 Seconds Fast Loop)
  useEffect(() => {
    if (!activeCaseId) {
      setCurrentChatMessages([]);
      return;
    }

    async function fetchLiveMessages() {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${activeCaseId}`);
        const data = await res.json();
        if (data.success && data.messages) {
          const mappedMessages: MessageData[] = data.messages.map((m: any) => ({
            id: m._id,
            sender: m.senderType,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }).toLowerCase()
          }));
          setCurrentChatMessages(mappedMessages);
        }
      } catch (err) {
        console.error("Messages Sync Failure:", err);
      }
    }

    fetchLiveMessages();
    const messagesInterval = setInterval(fetchLiveMessages, 2000);
    return () => clearInterval(messagesInterval);
  }, [activeCaseId]);

  // ✉️ TRANSMIT MESSAGE NODE
  const handleSendMessage = async (text: string) => {
    if (!activeCaseId) return;

    try {
      const payload = {
        roomId: activeCaseId,
        text: text,
        senderType: "client",
        senderName: casesList.find(c => c.id === activeCaseId)?.clientName || "Client User"
      };

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.message) {
        const newFormattedMsg: MessageData = {
          id: data.message._id,
          sender: "client",
          text: data.message.text,
          time: new Date(data.message.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }).toLowerCase()
        };
        setCurrentChatMessages((prev) => [...prev, newFormattedMsg]);
      }
    } catch (err) {
      console.error("Failed to route message node out to DB:", err);
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const currentActiveCase = casesList.find((c) => c.id === activeCaseId) || null;

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#050b1d]">
        <div className="w-9 h-9 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 dark:border-t-[#00c2a8] animate-spin mb-3" />
        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">Syncing Live Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-[#050b1d] overflow-hidden relative">
      <ProfileHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogoutClick={() => setIsLogoutOpen(true)}
        clientName={clientName}
      />

      <div className="flex-1 flex flex-row min-h-0 relative z-10">
        <OrderList
          cases={casesList}
          activeCaseId={activeCaseId}
          onSelectCase={(id) => setActiveCaseId(id)}
          onViewDetails={(item) => setSelectedCase(item)} 
        />
        
        <ChatArea
          activeCase={currentActiveCase}
          messages={currentChatMessages}
          onSendMessage={handleSendMessage}
          onCloseChat={() => setActiveCaseId(null)}
        />
      </div>

      {/* 🔥 Clean Outer-Mounted Global Drawer Element */}
      <AnimatePresence>
        <CaseDetailsDrawer 
          selectedCase={selectedCase} 
          onClose={() => setSelectedCase(null)} 
        />
      </AnimatePresence>

      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={async () => {
          try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          } catch (err) {
            console.error("Logout failed:", err);
            setIsLogoutOpen(false);
          }
        }}
      />
    </div>
  );
}