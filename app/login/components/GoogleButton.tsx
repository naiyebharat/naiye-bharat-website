"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

interface GoogleButtonProps {
  theme: "light" | "dark";
  showToast: (title: string, message: string, type: "success" | "error" | "info") => void;
  setServerError: (msg: string) => void;
}

export default function GoogleButton({ theme, showToast, setServerError }: GoogleButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        const google = (window as any).google;

        google.accounts.id.initialize({
          // Next.js mein frontend par env use karne ke liye NEXT_PUBLIC_ lagana zaroori hai
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            setServerError("");
            try {
              showToast("Verifying... please wait 🚀", "Authenticating with Google", "info");
              
              const res = await axios.post("/api/auth/google", {
                token: response.credential, // idToken backend ko bhej rahe hain
              });

              if (res.data.success) {
                showToast("Welcome! 🎉", "Redirecting to your dashboard...", "success");
                setTimeout(() => {
                  window.location.href = res.data.redirect;
                }, 500);
              }
            } catch (error: any) {
              const msg = error.response?.data?.error || "Google Authentication failed.";
              setServerError(msg);
            }
          },
        });

        if (buttonRef.current) {
          google.accounts.id.renderButton(buttonRef.current, {
            theme: theme === "dark" ? "filled_black" : "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: buttonRef.current.offsetWidth || 436, // Auto width handler
          });
        }
      }
    };

    // Script load checking
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [theme, setServerError, showToast]);

  return (
    <div className="w-full flex justify-center pt-2">
      {/* Google Container button ke liye */}
      <div ref={buttonRef} className="w-full min-h-[44px] rounded-xl overflow-hidden z-10" />
    </div>
  );
}