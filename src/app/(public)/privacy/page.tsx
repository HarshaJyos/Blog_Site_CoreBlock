import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CoreBlock',
  description: 'Read the CoreBlock Privacy Policy. Learn how we collect, use, store, and protect your personal data and respect your privacy rights.',
  openGraph: {
    title: 'Privacy Policy | CoreBlock',
    description: 'Read the CoreBlock Privacy Policy. Learn how we collect, use, store, and protect your personal data and respect your privacy rights.',
    url: 'https://coreblock.in/privacy',
    siteName: 'CoreBlock',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-950 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-zinc max-w-none text-zinc-600 space-y-8">
        <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">1. Introduction</h2>
          <p className="leading-relaxed">
            Welcome to CoreBlock. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our 
            website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">2. The Data We Collect About You</h2>
          <p className="leading-relaxed">
            We may collect, use, store and transfer different kinds of personal data about you which we have 
            grouped together as follows:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">3. How We Use Your Personal Data</h2>
          <p className="leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your 
            personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">4. Data Security</h2>
          <p className="leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being 
            accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">5. Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about this privacy policy or our privacy practices, please contact us 
            via our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
