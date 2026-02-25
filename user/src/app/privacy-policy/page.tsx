import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SwaraDigital",
  description: "SwaraDigital privacy policy and data protection guidelines.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 uppercase">
          Privacy <span className="text-indigo-500">Policy</span>
        </h1>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Introduction</h2>
            <p>
              At SwaraDigital, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our music distribution services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you create an account, upload music, or communicate with our support team. This may include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Contact information (name, email address, phone number).</li>
              <li>Artist information (stage name, biography, social media links).</li>
              <li>Financial information (payment details for royalty payouts).</li>
              <li>Content data (audio files, artwork, metadata).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our distribution services, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Distributing your music to streaming platforms and stores.</li>
              <li>Processing royalty payments and providing analytics.</li>
              <li>Communicating with you about your account and releases.</li>
              <li>Ensuring compliance with platform policies and legal requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Data Sharing and Disclosure</h2>
            <p>
              We share your information with third-party streaming platforms (e.g., Spotify, Apple Music) and payment processors only as necessary to provide our services. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Your Data Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You can manage your account settings through our dashboard or contact our support team for assistance with data-related requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">6. Security Measures</h2>
            <p>
              We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">7. Contact Us</h2>
            <p>
              If you have any questions or concerns about our Privacy Policy, please contact us at <a href="mailto:privacy@musicflow.com" className="text-indigo-400 hover:underline">privacy@musicflow.com</a>.
            </p>
          </section>

          <div className="pt-10 border-t border-slate-800 text-sm text-slate-500">
            Last updated: February 25, 2026
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
