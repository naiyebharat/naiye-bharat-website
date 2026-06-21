import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import AdminBypass from "@/components/AdminBypass"; // <-- Naya wrapper import kiya
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "NaiyeBharat | Premium Legal Services",
  description: "A trusted legal partner bringing justice with integrity, expertise, and excellence.",
  verification: {
    google: "kdcLvXhpB85_ruhG6TSnCqYa-Hij8N2PzfmILssgLxY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased scroll-smooth ${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
        <script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
          crossOrigin=""
        ></script>
      </head>
      <body className="bg-slate-50 flex flex-col min-h-screen text-slate-800 font-sans selection:bg-gold/30 selection:text-oxford">
        
        {/* Dynamic Wrapper handles UI visibility dynamically based on router paths */}
        <AdminBypass>
          {children}
        </AdminBypass>
       
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}