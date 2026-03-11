import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | CoreBlock',
  description: 'Read the Terms and Conditions for using CoreBlock. Information regarding intellectual property, user content rules, and platform agreements.',
  openGraph: {
    title: 'Terms and Conditions | CoreBlock',
    description: 'Read the Terms and Conditions for using CoreBlock. Information regarding intellectual property, user content rules, and platform agreements.',
    url: 'https://coreblock.in/terms',
    siteName: 'CoreBlock',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-950 mb-8">Terms and Conditions</h1>
      
      <div className="prose prose-zinc max-w-none text-zinc-600 space-y-8">
        <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">1. Agreement to Terms</h2>
          <p className="leading-relaxed">
            By accessing or using CoreBlock, you agree to be bound by these Terms and Conditions. 
            If you disagree with any part of the terms, then you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">2. Intellectual Property</h2>
          <p className="leading-relaxed">
            The Service and its original content, features, and functionality are and will remain the exclusive 
            property of CoreBlock and its licensors. Our trademarks and trade dress may not be used in connection 
            with any product or service without the prior written consent of CoreBlock.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">3. User Content</h2>
          <p className="leading-relaxed">
            Our Service allows you to post, link, store, share and otherwise make available certain information, 
            text, graphics, videos, or other material ("Content"). You are responsible for the Content that you 
            post to the Service, including its legality, reliability, and appropriateness.
          </p>
          <p className="leading-relaxed mt-4">
            By posting Content to the Service, you grant us the right and license to use, modify, publicly 
            perform, publicly display, reproduce, and distribute such Content on and through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">4. Termination</h2>
          <p className="leading-relaxed">
            We may terminate or suspend your account immediately, without prior notice or liability, for any 
            reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right 
            to use the Service will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">5. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">6. Changes</h2>
          <p className="leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will 
            try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a 
            material change will be determined at our sole discretion.
          </p>
        </section>
      </div>
    </div>
  );
}
