// @ts-nocheck
"use client";

import React, { useRef, useEffect } from "react";
import ZegoCallWidget from "@/components/ZegoCallWidget";

interface SOSWorkspaceProps {
  activeSOS: any;
  currentCoords: { lat: number; lng: number };
  messages: any[];
  newMessageText: string;
  isChatOpen: boolean;
  isSimulatingTravel: boolean;
  advocateProfile: any;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (e: React.FormEvent) => void;
  onMessageChange: (val: string) => void;
  onUpdateSOSStatus: (status: string) => void;
  onToggleSimulateTravel: () => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export default function SOSWorkspace({
  activeSOS,
  currentCoords,
  messages,
  newMessageText,
  isChatOpen,
  isSimulatingTravel,
  advocateProfile,
  chatEndRef,
  onSendMessage,
  onMessageChange,
  onUpdateSOSStatus,
  onToggleSimulateTravel,
  calculateDistance,
}: SOSWorkspaceProps) {
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const lawyerMarkerRef = useRef<any>(null);
  const mapContainerId = "advocate-leaflet-map";

  useEffect(() => {
    if (activeSOS && typeof window !== "undefined" && (window as any).L) {
      const L = (window as any).L;
      const container = document.getElementById(mapContainerId);
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([currentCoords.lat, currentCoords.lng], 15);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      const clientLat = activeSOS.clientLocation.coordinates[1];
      const clientLng = activeSOS.clientLocation.coordinates[0];

      if (lawyerMarkerRef.current) {
        lawyerMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
      } else {
        const lawyerIcon = L.divIcon({
          className: "lawyer-marker-gold-large",
          html: `<div class="flex items-center justify-center w-9 h-9 bg-amber-500 border-2 border-white rounded-full shadow-2xl text-white"><i class="fas fa-scale-balanced text-sm"></i></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        lawyerMarkerRef.current = L.marker([currentCoords.lat, currentCoords.lng], { icon: lawyerIcon }).addTo(map);
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([clientLat, clientLng]);
      } else {
        const userIcon = L.divIcon({
          className: "client-marker-pulse-large",
          html: `<div class="relative flex items-center justify-center"><span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-75"></span><div class="relative rounded-full h-4.5 w-4.5 bg-red-600 border-2 border-white shadow-md"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarkerRef.current = L.marker([clientLat, clientLng], { icon: userIcon }).addTo(map);
      }

      const bounds = L.latLngBounds(
        [currentCoords.lat, currentCoords.lng],
        [clientLat, clientLng]
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [activeSOS, currentCoords]);

  return (
    <div className="w-full h-screen flex flex-col md:flex-row relative z-40 bg-slate-950 text-slate-100">
      {/* Main Leaflet Map Area */}
      <div className="flex-1 h-[40vh] md:h-full w-full relative z-0">
        <div id={mapContainerId} className="w-full h-full" />

        {/* Map Header Status info */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Emergency Incident</div>
              <div className="text-xs font-black text-white">{activeSOS.emergencyType}</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <i className="fas fa-route"></i>
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Client Distance</div>
              <div className="text-xs font-bold font-mono text-amber-400">
                {calculateDistance(
                  currentCoords.lat,
                  currentCoords.lng,
                  activeSOS.clientLocation.coordinates[1],
                  activeSOS.clientLocation.coordinates[0]
                ).toFixed(2)} km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Control & Chat Panel */}
      <div className="w-full md:w-[420px] bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-900 h-[60vh] md:h-full flex flex-col justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* Client detail Header */}
        <div className="p-6 border-b border-slate-900 flex justify-between items-center">
          <div>
            <div className="text-[8px] uppercase tracking-[0.2em] font-bold text-red-500 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> Active Engagement
            </div>
            <h4 className="font-bold text-base text-white font-serif">{activeSOS.client?.name || "Client Support"}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{activeSOS.client?.phoneNumber || "No Contact"}</p>
          </div>

          <ZegoCallWidget
            sosId={activeSOS._id}
            user={advocateProfile ? { id: advocateProfile.id, name: advocateProfile.name, role: "advocate" } : null}
            peerLabel={activeSOS.client?.name || "Client"}
            compact
          />
        </div>

        {/* Chat message space */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-premium flex flex-col justify-end">
          {isChatOpen ? (
            <div className="h-full flex flex-col justify-between">
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-900 pb-1.5 mb-2 flex justify-between items-center">
                <span>Incident Chat Room</span>
                <span className="text-[8px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pb-3 min-h-[140px] scrollbar-premium">
                {messages.length === 0 ? (
                  <div className="text-center text-[10px] text-slate-600 mt-6 font-bold uppercase tracking-wider">
                    Incident communication initialized. Send a text.
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[75%] ${
                        msg.senderType === "expert" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.senderType === "expert"
                            ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                            : "bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                        {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={onSendMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => onMessageChange(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
                <button type="submit" className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 text-xs hover:bg-amber-600 active:scale-95 transition-all">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          ) : null}
        </div>

        {/* Bottom Actions and Status controller */}
        <div className="p-6 border-t border-slate-900 space-y-4">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-2">Travel & Engagement controls</div>

            {activeSOS.status === "accepted" && (
              <button
                onClick={() => onUpdateSOSStatus("en_route")}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Start Travel <i className="fas fa-car"></i>
              </button>
            )}

            {activeSOS.status === "en_route" && (
              <div className="space-y-3">
                <button
                  onClick={() => onUpdateSOSStatus("arrived")}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Mark Arrived at Location <i className="fas fa-street-view"></i>
                </button>

                <button
                  onClick={onToggleSimulateTravel}
                  className={`w-full py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-2 ${
                    isSimulatingTravel
                      ? "bg-amber-950/20 border-amber-500/20 text-amber-500"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <i className={`fas ${isSimulatingTravel ? "fa-circle-notch animate-spin" : "fa-person-running"}`}></i>
                  {isSimulatingTravel ? "Simulating vehicle movement..." : "Start Simulated Travel"}
                </button>
              </div>
            )}

            {activeSOS.status === "arrived" && (
              <button
                onClick={() => onUpdateSOSStatus("completed")}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Complete Incident Support <i className="fas fa-check-double"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
