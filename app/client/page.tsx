"use client";

import React, { useState, useEffect } from "react";
import ProfileHeader from "./components/ProfileHeader";
import OrderList, { CaseOrder } from "./components/OrderList";
import ChatArea, { MessageData } from "./components/ChatArea";
import SOSPanel, { ClientSOSRequest, SOSMessageData } from "./components/SOSPanel";
import CaseDetailsDrawer from "./components/CaseDetails";
import Toast, { ToastData } from "../advocate/components/Toast"; 
import LogoutModal from "../advocate/components/LogoutModal";
import { AnimatePresence } from "framer-motion";
import { Briefcase, Siren } from "lucide-react";
import { pusherClient } from "@/utils/libs/pusherClient";
import { getSpecialistName } from "./utils";

export default function ClientPortal() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"cases" | "sos">("cases");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [casesList, setCasesList] = useState<CaseOrder[]>([]);
  const [sosRequests, setSosRequests] = useState<ClientSOSRequest[]>([]);
  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [sosMessages, setSosMessages] = useState<SOSMessageData[]>([]);
  const [sosLoading, setSosLoading] = useState<boolean>(true);
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
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: "client" } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sosId = params.get("sos");
    if (sosId) {
      setActiveTab("sos");
      setActiveSosId(sosId);
      setActiveCaseId(null);
    }
  }, []);

  // Fetch dynamic profile details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setClientName(data.user.name);
          setCurrentUser({ id: data.user.id, name: data.user.name, role: "client" });
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

  useEffect(() => {
    async function fetchSosPipeline() {
      try {
        const res = await fetch("/api/client/sos");
        const data = await res.json();
        if (data.success && data.sosRequests) {
          setSosRequests(data.sosRequests);
          setActiveSosId((current) => current || data.sosRequests[0]?.id || null);
        }
      } catch (err) {
        console.error("SOS Sync Error:", err);
      } finally {
        setSosLoading(false);
      }
    }

    fetchSosPipeline();
    const sosInterval = setInterval(fetchSosPipeline, 4000);
    return () => clearInterval(sosInterval);
  }, []);

  // Load chat history from DB whenever active SOS changes
  useEffect(() => {
    if (!activeSosId) {
      setSosMessages([]);
      return;
    }

    // Fetch persisted messages from DB
    async function loadChatHistory() {
      try {
        const res = await fetch(`/api/sos/chat?sosId=${activeSosId}`);
        const data = await res.json();
        if (data.success && data.messages) {
          setSosMessages(data.messages);
        }
      } catch (err) {
        console.error("SOS chat history fetch error:", err);
      }
    }

    loadChatHistory();

    // Subscribe for real-time new messages
    const channel = pusherClient.subscribe(`sos-${activeSosId}`);

    channel.bind("status-update", (data: any) => {
      let sanitizedLawyer = undefined;
      if (data.lawyer) {
        sanitizedLawyer = {
          ...data.lawyer,
          name: getSpecialistName(data.lawyer.id),
          phoneNumber: undefined,
          avatar: "",
        };
      }
      setSosRequests((prev) =>
        prev.map((item) =>
          item.id === activeSosId
            ? {
                ...item,
                status: data.status || item.status,
                eta: data.eta || item.eta,
                lawyer: data.lawyer ? sanitizedLawyer : item.lawyer,
              }
            : item
        )
      );
    });

    channel.bind("chat-message", (msg: any) => {
      // Avoid duplicates: check by id if present
      setSosMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id || `rt-${Date.now()}-${prev.length}`,
            senderType: msg.senderType,
            senderName: msg.senderName,
            text: msg.text,
            createdAt: msg.createdAt || new Date().toISOString(),
          },
        ];
      });
    });

    return () => {
      pusherClient.unsubscribe(`sos-${activeSosId}`);
    };
  }, [activeSosId]);

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

  const handleSendSosMessage = async (text: string) => {
    if (!activeSosId) return;

    try {
      await fetch("/api/sos/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sosId: activeSosId,
          senderType: "client",
          senderName: clientName,
          text,
        }),
      });
    } catch (err) {
      console.error("Failed to send SOS message:", err);
      setToast({
        show: true,
        title: "Send Failed",
        message: "Could not send emergency message.",
        type: "error",
      });
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

      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 sm:px-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("cases");
            setActiveSosId(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
            activeTab === "cases"
              ? "bg-emerald-600 dark:bg-[#00c2a8] text-white dark:text-[#050b1d] border-emerald-600 dark:border-[#00c2a8]"
              : "bg-white dark:bg-[#050b1d] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Cases
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("sos");
            setActiveCaseId(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
            activeTab === "sos"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white dark:bg-[#050b1d] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-red-600 dark:hover:text-red-400"
          }`}
        >
          <Siren className="w-3.5 h-3.5" /> SOS
          {sosRequests.some((item) => ["pending", "accepted", "en_route", "arrived"].includes(item.status)) && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-row min-h-0 relative z-10">
        {activeTab === "cases" ? (
          <>
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
          </>
        ) : (
          <SOSPanel
            requests={sosRequests}
            activeSosId={activeSosId}
            messages={sosMessages}
            loading={sosLoading}
            user={currentUser}
            onSelect={(id) => setActiveSosId(id)}
            onSendMessage={handleSendSosMessage}
            onClose={() => setActiveSosId(null)}
          />
        )}
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
