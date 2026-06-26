"use client";

import { useCallback, useEffect, useState } from "react";

function LogoSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,2" />
      <rect x="47" y="25" width="6" height="45" fill="#d4af37" />
      <rect x="40" y="65" width="20" height="8" rx="4" fill="#d4af37" />
      <rect x="44" y="20" width="12" height="6" rx="3" fill="#d4af37" />
      <rect x="30" y="35" width="40" height="3" fill="#d4af37" />
      <circle cx="38" cy="40" r="2" fill="#d4af37" />
      <line x1="38" y1="42" x2="38" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="32" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="44" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 30 48 Q 38 55 46 48 L 46 52 Q 38 59 30 52 Z" fill="#d4af37" />
      <circle cx="62" cy="40" r="2" fill="#d4af37" />
      <line x1="62" y1="42" x2="62" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="56" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="68" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 54 48 Q 62 55 70 48 L 70 52 Q 62 59 54 52 Z" fill="#d4af37" />
    </svg>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // ── Step 1: Check sessionStorage cache first → no spinner flicker ──
    const SESSION_KEY = "nb_auth_user";
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setIsLoadingUser(false); // Hide spinner immediately using cache
      }
    } catch {
      // ignore parse errors
    }

    // ── Step 2: Always verify in background (keeps data fresh) ──
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user)); } catch {}
        } else {
          setUser(null);
          try { sessionStorage.removeItem(SESSION_KEY); } catch {}
        }
      } catch (err: any) {
        // On abort/network error, keep whatever was in cache (don't flicker)
        if (err?.name !== "AbortError") {
          setUser(null);
          try { sessionStorage.removeItem(SESSION_KEY); } catch {}
        }
      } finally {
        setIsLoadingUser(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        setShowLogoutModal(false);
        // Clear cached auth so navbar doesn't show stale user after logout
        try { sessionStorage.removeItem("nb_auth_user"); } catch {}
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const btn = document.getElementById("mobile-menu-button");
    const menu = document.getElementById("mobile-menu");
    const servicesBtn = document.getElementById("mobile-services-btn");
    const servicesMenu = document.getElementById("mobile-services-menu") as HTMLElement | null;

    const toggleMenu = () => menu?.classList.toggle("hidden");
    btn?.addEventListener("click", toggleMenu);

    const toggleServices = () => {
      if (!servicesMenu) return;
      const isOpen = servicesMenu.style.maxHeight !== "0px" && servicesMenu.style.maxHeight !== "";
      servicesMenu.style.maxHeight = isOpen ? "0px" : "200px";
      const svg = servicesBtn?.querySelector("svg") as HTMLElement | null;
      if (svg) svg.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
    };
    servicesBtn?.addEventListener("click", toggleServices);

    return () => {
      btn?.removeEventListener("click", toggleMenu);
      servicesBtn?.removeEventListener("click", toggleServices);
    };
  }, []);

  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'client':
        return { path: '/client', label: 'Client Panel' };
      case 'advocate':
        return { path: '/advocate', label: 'Advocate Panel' };
      case 'admin':
        return { path: '/admin', label: 'Admin Panel' };
      default:
        return { path: '/client', label: 'User Panel' };
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin-once { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .rotate-once { animation: spin-once 2s ease-in-out 1; }
        @keyframes logoGlow {
          0%   { filter: drop-shadow(0 0 0px  rgba(212,175,55,0)); }
          50%  { filter: drop-shadow(0 0 15px rgba(212,175,55,0.8)); }
          100% { filter: drop-shadow(0 0 8px  rgba(212,175,55,0.4)); }
        }
        .animate-logo-glow { animation: logoGlow 2s ease-in-out 0.5s both; }
        @keyframes emergeFromLogo {
          0%   { opacity: 0; transform: scale(0)   translateX(-50px); filter: blur(10px); }
          50%  { opacity: 0.5; transform: scale(0.8) translateX(-20px); filter: blur(5px); }
          100% { opacity: 1; transform: scale(1)   translateX(0); filter: blur(0); }
        }
        .animate-emerge { animation: emergeFromLogo 1.5s ease-out 0.8s both; }
        @keyframes shine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .button-bg {
          background: conic-gradient(from 0deg, #00F5FF, #000, #000, #00F5FF, #000, #000, #000, #00F5FF);
          background-size: 300% 300%;
          animation: shine 6s ease-out infinite;
        }
        .navbar-scrolled {
          background-color: rgba(255,255,255,0.95) !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .navbar-scrolled .nav-link { color: #374151; }
        .navbar-scrolled .nav-link:hover { color: #3b82f6; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.2s ease-out forwards; }
      `}</style>

      <nav id="navbar" className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between">

            {/* Logo + Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rotate-once animate-logo-glow cursor-pointer" onClick={scrollToTop}>
                <LogoSVG />
              </div>
              <a href="#" className="text-xl md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-all duration-300 animate-emerge hover:scale-105">
                NaiyeBharat
              </a>
            </div>

            {/* Navigation links & Actions group */}
            <div className="flex items-center space-x-4 md:space-x-6">

              {/* Desktop Nav Links (hidden on mobile) */}
              <div className="hidden md:flex md:items-center space-x-6">
                <a href="/"    className="nav-link text-gray-700 hover:text-blue-600 font-medium transition-all duration-300">Home</a>
                <a href="/about"   className="nav-link text-gray-700 hover:text-blue-600 font-medium transition-all duration-300">About Us</a>
                <a href="/pricing" className="nav-link text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors">Pricing</a>

                {/* Services Dropdown */}
                <div className="relative group">
                  <a href="#services" className="nav-link text-gray-700 hover:text-blue-600 font-medium flex items-center py-2 transition-colors">
                    Services
                    <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white shadow-xl rounded-md border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <a href="/civil"     className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Civil Law</a>
                    <a href="/criminal"  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Criminal Law</a>
                    <a href="/Corporate" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Corporate Law</a>
                    <a href="/family"    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Family Law</a>
                    <a href="/Property"  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Property Law</a>
                    <a href="/CourtMarriage"       className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">marriages</a>
                  </div>
                </div>

                <a href="/privacy" className="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors">Policies</a>
              </div>

              {/* Dynamic Auth Button / Profile Section (Desktop and Mobile) */}
              {isLoadingUser ? (
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
              ) : user ? (
                <div className="relative flex items-center">
                  <div 
                    className="flex items-center space-x-1 md:space-x-2.5 cursor-pointer group"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white font-bold text-xs md:text-sm flex items-center justify-center border border-blue-100 shadow-sm transition-transform duration-300 hover:scale-105">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:inline text-gray-700 font-semibold text-sm group-hover:text-blue-600 transition-colors ml-2">
                      {user.name}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all duration-200">
                        <a
                          href={getRoleDetails(user.role).path}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className="w-4.5 h-4.5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {getRoleDetails(user.role).label}
                        </a>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer"
                        >
                          <svg className="w-4.5 h-4.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="cursor-pointer button-bg rounded-full p-0.5 hover:scale-105 transition duration-300 active:scale-100">
                  <button onClick={() => (window.location.href = "/login")} className="cursor-pointer px-4 md:px-8 text-xs md:text-sm py-1.5 md:py-2.5 text-white rounded-full font-medium bg-gray-800">
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile hamburger menu */}
              <div className="flex md:hidden">
                <button id="mobile-menu-button" className="text-gray-700 hover:text-blue-600 focus:outline-none transition-colors" aria-label="Open menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="md:hidden hidden px-4 pt-2 pb-4 space-y-2 bg-white shadow-md border-t border-gray-100 transition-all duration-300">
          <a href="#home"    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors">Home</a>
          <a href="/about"   className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors">About Us</a>
          <a href="/pricing" className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors">Pricing</a>
          <div>
            <button id="mobile-services-btn" className="w-full text-left flex justify-between items-center text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors">
              Services
              <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="mobile-services-menu" style={{ maxHeight: "0px", overflow: "hidden", transition: "max-height 0.3s ease" }} className="pl-4 mt-1 space-y-1">
              <a href="/civil"     className="block text-gray-600 hover:text-blue-600 py-1 transition-colors">Civil Law</a>
              <a href="/criminal"  className="block text-gray-600 hover:text-blue-600 py-1 transition-colors">Criminal Law</a>
              <a href="/corporate" className="block text-gray-600 hover:text-blue-600 py-1 transition-colors">Corporate Law</a>
              <a href="/family"    className="block text-gray-600 hover:text-blue-600 py-1 transition-colors">Family Law</a>
              <a href="/property"  className="block text-gray-600 hover:text-blue-600 py-1 transition-colors">Property Law</a>
              <a href="/tax"       className="block text-gray-600 hover:text-blue-600 py-1 transition-colors">Court marriage</a>
            </div>
          </div>
          <a href="/privacy" className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors">Policies</a>
          
          {/* Dynamic Mobile Auth */}
          {isLoadingUser ? (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
            </div>
          ) : user ? (
            <div className="pt-2 pb-1 border-t border-gray-100">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mr-3">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-1 space-y-1">
                <a
                  href={getRoleDetails(user.role).path}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  {getRoleDetails(user.role).label}
                </a>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <a href="/signup" className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center shadow-md mt-3">
              login/signup
            </a>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 transform transition-all animate-scaleUp">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure want to log out? You will need to log in again to access your dashboard.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/70 rounded-lg flex items-center justify-center transition-colors min-w-[90px] cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logout...
                  </>
                ) : (
                  'Log Out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}