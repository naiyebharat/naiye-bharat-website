"use client";

import { useState, useEffect} from "react";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import ResetPasswordFlow from "./components/ResetPasswordFlow";
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
            <ResetPasswordFlow
              onSwitchToLogin={() => setViewState("login")}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}

        </div>
      </main>
    </div>
  );
}