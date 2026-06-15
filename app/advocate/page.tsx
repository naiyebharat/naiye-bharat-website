// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProfileHeader from "./components/ProfileHeader";
import RequestList, { ClientRequest } from "./components/RequestList";
import ChatArea from "./components/ChatArea";
import LogoutModal from "./components/LogoutModal";
import ThemeToggle from "./components/ThemeToggle";
import Toast, { ToastData } from "./components/Toast";
import axios from "axios";

const POLL_ROOMS_INTERVAL = 8000; // Poll rooms list every 8s

export default function AdvocateDashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [activeClient, setActiveClient] = useState<ClientRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [toast, setToast] = useState<ToastData>({ show: false, title: "", message: "", type: "info" });
  const [advocateName, setAdvocateName] = useState<string>("Advocate");

  // Fetch dynamic profile details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.user) {
          setAdvocateName(res.data.user.name);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    }
    fetchProfile();
  }, []);

  // 🔥 Dynamic rooms from DB
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Theme init
  useEffect(() => {
    const savedTheme = localStorage.getItem("nb_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const handleToggleTheme = () => {
    if (!theme) return;
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("nb_theme", nextTheme);
    if (nextTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const triggerToast = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ show: true, title, message, type });
  };

  // Fetch rooms from API
  const fetchRooms = useCallback(async (silent = false) => {
    try {
      if (!silent) setRoomsLoading(true);
      const res = await axios.get("/api/advocate/rooms");
      if (res.data.success) {
        const rooms: ClientRequest[] = res.data.data || [];
        setRequests(rooms);

        // If active client still exists in the new list, keep it in sync
        setActiveClient((prev) => {
          if (!prev) return null;
          const updated = rooms.find((r) => r.id === prev.id);
          return updated || prev;
        });
      }
    } catch (err: any) {
      if (!silent) {
        triggerToast("Sync Error", "Could not load client requests. Retrying...", "error");
      }
      console.error("Rooms fetch error:", err);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchRooms(false);
    const interval = setInterval(() => fetchRooms(true), POLL_ROOMS_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleSelectClient = (client: ClientRequest) => {
    setActiveClient(client);
    setIsChatOpen(true);

    // Mark room as active_discussion if pending
    if (client.status === "pending_expert") {
      axios.patch("/api/advocate/rooms", {
        roomId: client.roomId,
        status: "active_discussion",
      }).then(() => fetchRooms(true)).catch(console.error);
    }
  };

  const handleCloseChat = () => {
    setActiveClient(null);
    setIsChatOpen(false);
  };

  const handleConfirmLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLogoutOpen(false);
    }
  };

  if (!theme) return <div className="min-h-screen w-full bg-[#050b1d]" />;

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-[#050b1d] overflow-hidden select-none transition-colors duration-300">
      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleConfirmLogout} />

      <ProfileHeader
        advocateName={advocateName}
        onLogoutTrigger={() => setIsLogoutOpen(true)}
        toggleElement={<ThemeToggle theme={theme} onToggleTheme={handleToggleTheme} />}
      />

      {/* LOWER WORKSPACE */}
      <div className="flex-1 flex overflow-hidden w-full relative">

        {/* LEFT SIDEBAR — Request List */}
        <div className={`w-full md:w-85 lg:w-96 h-full flex-shrink-0 ${isChatOpen ? "hidden md:flex" : "flex"}`}>
          <RequestList
            requests={requests}
            activeId={activeClient?.id || null}
            onSelect={handleSelectClient}
            loading={roomsLoading}
          />
        </div>

        {/* RIGHT PANEL — Chat Area */}
        <div className={`flex-1 h-full ${isChatOpen ? "flex" : "hidden md:flex"}`}>
          <ChatArea
            activeClient={activeClient}
            onCloseChat={handleCloseChat}
            triggerToast={triggerToast}
          />
        </div>

      </div>
    </div>
  );
}