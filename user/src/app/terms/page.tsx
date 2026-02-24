import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | SwaraDigital",
  description: "Terms and conditions for using SwaraDigital music distribution services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 uppercase">
          Terms & <span className="text-indigo-500">Conditions</span>
        </h1>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the SwaraDigital platform ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Services Provided</h2>
            <p>
              SwaraDigital provides music distribution services, allowing independent artists and labels to distribute their content to major streaming platforms and digital stores worldwide.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. User Commitments</h2>
            <p>
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>You are at least 18 years of age.</li>
              <li>You own or have the necessary rights to the content you upload.</li>
              <li>Your content does not infringe upon the intellectual property rights of any third party.</li>
              <li>Your content is not illegal, harmful, or fraudulent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Royalties and Payments</h2>
            <p>
              SwaraDigital ensures that you keep 100% of the royalties received from streaming platforms, subject to the terms of your specific plan. Payouts are processed according to our financial cycles and may be subject to minimum threshold requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Content Moderation</h2>
            <p>
              We reserve the right to review, reject, or remove any content that violates our policies or the policies of our partner platforms. This includes, but is not limited to, artificial streaming (bot activity), copyright infringement, and deceptive metadata.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">6. Limitation of Liability</h2>
            <p>
              SwaraDigital shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service.
            </p>
          </section>

          <section>
             <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">7. Modifications to Terms</h2>
             <p>
               We may update these terms from time to time. Continued use of the Service after any changes constitutes acceptance of the new terms.
             </p>
          </section>

          <div className="pt-10 border-t border-slate-800 text-sm text-slate-500">
            Last updated: February 24, 2026
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
