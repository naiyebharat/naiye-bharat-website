"use client";

import Link from "next/link";

export default function Signup() {
  const handleBypass = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Signup is currently in demo mode. Your account has been initialized successfully.");
    window.location.href = "/login";
  };

  return (
    <main className="flex-1 hero-gradient min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-600/5 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="text-center mb-10">
             <h1 className="text-3xl font-serif font-bold text-oxford-900 mb-2 tracking-tight">Create <span className="brand-gradient">Account.</span></h1>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Join the Professional Network</p>
          </div>

          <form onSubmit={handleBypass} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold-600 ml-4">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-oxford-900 outline-none focus:ring-2 focus:ring-gold-500 transition-all placeholder:text-slate-300"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold-600 ml-4">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-oxford-900 outline-none focus:ring-2 focus:ring-gold-500 transition-all placeholder:text-slate-300"
                placeholder="advocate@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold-600 ml-4">Security Password</label>
              <input 
                type="password" 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-oxford-900 outline-none focus:ring-2 focus:ring-gold-500 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="group relative w-full py-5 bg-oxford-900 text-gold-400 font-bold border border-gold-500/30 rounded-2xl text-center shadow-lg hover:shadow-gold-500/20 transition-all uppercase tracking-widest text-xs overflow-hidden block"
            >
              <span className="relative z-10 group-hover:text-oxford-900 transition-colors">Initialize Account</span>
              <div className="absolute inset-0 bg-gold-500 transform translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
             <p className="text-slate-400 text-sm mb-4">Already part of the network?</p>
             <Link href="/login" className="text-oxford-900 font-bold uppercase tracking-widest text-[11px] hover:text-gold-600 transition-colors">
                Return to Secure Login
             </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-white/30 text-[10px] uppercase tracking-widest">Secured by NaiyeBharat Professional Protocols</p>
      </div>
    </main>
  );
}
