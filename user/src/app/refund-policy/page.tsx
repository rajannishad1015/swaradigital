import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | SwaraDigital",
  description: "SwaraDigital refund policy for music distribution services.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 uppercase">
          Refund <span className="text-indigo-500">Policy</span>
        </h1>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. General Overview</h2>
            <p>
              At SwaraDigital, we strive to provide the best music distribution experience. Since our services involve digital distribution and upfront processing costs with partner platforms, our refund policy is designed to be fair to both the artist and the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Distribution Services</h2>
            <p>
              Once a release has been submitted and approved for distribution to digital stores, we cannot offer a refund for that specific release. This is because the distribution fee covers the processing and ingest costs that are non-refundable from our end.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. Subscription Refunds</h2>
            <p>
              For annual subscription plans (e.g., Pro Artist):
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Refund requests made within 7 days of the initial purchase may be eligible for a full refund, provided no content has been distributed under the plan.</li>
              <li>Requests made after 7 days or after any content has been distributed are generally not eligible for a refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Failed Distribution</h2>
            <p>
              In the rare event that a release is rejected by all streaming platforms due to technical issues on our end (and not due to content violations or deceptive metadata), we will provide a full refund or a credit for a replacement release.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Requesting a Refund</h2>
            <p>
              To request a refund, please contact our support team at <a href="mailto:support@musicflow.com" className="text-indigo-400 hover:underline">support@musicflow.com</a> with your account details and the reason for the request. We aim to process all requests within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">6. Exceptional Circumstances</h2>
            <p>
              We reserve the right to grant refunds on a case-by-case basis for exceptional circumstances not covered in this policy.
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
