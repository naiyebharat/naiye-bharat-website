"use client";

import { useState, useEffect} from "react";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import { seededRandom } from "@/utils/random";

export default function LoginPage() {
  const [viewState, setViewState] = useState<"login" | "signup" | "forgot">("login");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nb_theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nb_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-100 dark:bg-[#070c19] transition-colors duration-300 overflow-hidden">

        {/* Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-slate-400 dark:bg-[#00c2a8] opacity-60"
              style={{
                top: `${seededRandom(i * 7) * 100}%`,
                left: `${seededRandom(i * 7 + 1) * 100}%`,
                width: `${seededRandom(i * 7 + 2) * 5 + 3}px`,
                height: `${seededRandom(i * 7 + 2) * 5 + 3}px`,
              }}
            />
          ))}
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-[540px]">

          {viewState === "login" && (
            <LoginForm
              onSwitchToSignUp={() => setViewState("signup")}
              onSwitchToForgot={() => setViewState("forgot")}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}

          {viewState === "signup" && (
            <SignUpForm
              onSwitchToLogin={() => setViewState("login")}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}

          {viewState === "forgot" && (
            <div className="w-full bg-white dark:bg-[#0d1527] p-10 rounded-3xl shadow-xl text-center border border-slate-300 dark:border-slate-800/80 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">Reset Security</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Enter your work email recovery routing targets.</p>
              <button
                onClick={() => setViewState("login")}
                className="mt-6 text-xs uppercase tracking-widest text-amber-600 dark:text-[#00c2a8] font-bold hover:underline cursor-pointer block mx-auto"
              >
                Return to Login
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}