'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalSOS from './GlobalSOS';

export default function AdminBypass({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const shouldBypass = 
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/counseling') || 
    pathname?.startsWith('/advocate') ||
    pathname?.startsWith('/client'); 

  if (shouldBypass) {
    // Admin, Counseling, Advocate, Client portals aur Auth pages par purely clean screen render hogi
    return <>{children}</>;
  }

  // Normal public website pages par sab kuch dikhao
  return (
    <>
      <Navbar />
      {children}
      <GlobalSOS />
      <Footer />
    </>
  );
}