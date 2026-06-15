"use client";

export default function Terms() {
  return (
    <main className="flex-1 bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-oxford-900 border-b-2 border-gold-500 pb-4">Terms of Service</h1>
        <p className="text-slate-500 text-sm">Last Updated: April 2026</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm lg:text-base">
          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using NaiyeBharat, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">2. Legal Disclaimer</h2>
            <p>The information on this website is for general information purposes only and does not constitute legal advice. Using this platform does not create an attorney-client relationship until a formal agreement is signed with an advocate.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">3. Use of Service</h2>
            <p>Users must provide accurate information when requesting consultations. Misuse of the platform or providing fraudulent information will result in immediate termination of service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">4. Limitation of Liability</h2>
            <p>NaiyeBharat acting as a platform to connect clients with legal experts shall not be held liable for any outcomes of legal matters beyond the scope of initial consulting provided through the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">5. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in New Delhi.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
