"use client";

export default function Privacy() {
  return (
    <main className="flex-1 bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-oxford-900 border-b-2 border-gold-500 pb-4">Privacy Policy</h1>
        <p className="text-slate-500 text-sm">Last Updated: April 2026</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">1. Information We Collect</h2>
            <p>At NaiyeBharat, we collect minimal information necessary to provide legal consulting services. This includes your name, contact details, and case summaries provided through our forms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">2. How We Use Information</h2>
            <p>We use your information strictly for connecting you with legal experts and maintaining our internal records for consultation scheduling.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">3. Data Security & Confidentiality</h2>
            <p>Legal matters are highly sensitive. We implement industry-standard encryption and security protocols to ensure your data remains confidential. We never share your data with third parties without explicit legal consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-oxford-900 mb-3">4. Your Rights</h2>
            <p>You have the right to request deletion of your data or a copy of any information we hold about you at any time.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
