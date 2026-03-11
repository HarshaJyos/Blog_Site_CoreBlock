import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CoreBlock',
  description: 'Get in touch with the CoreBlock team for support or business inquiries. We are here to help.',
  openGraph: {
    title: 'Contact Us | CoreBlock',
    description: 'Get in touch with the CoreBlock team for support or business inquiries. We are here to help.',
    url: 'https://coreblock.in/contact',
    siteName: 'CoreBlock',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-950 mb-8">Contact Us</h1>
      
      <div className="prose prose-zinc max-w-none text-zinc-600">
        <p className="text-lg leading-relaxed mb-8">
          Have a question, feedback, or need support? We&apos;d love to hear from you. 
          Please reach out to us using the information below.
        </p>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Contact Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-900 mb-1">Email</p>
                <a href="mailto:support.coreblock@gmail.com" className="text-zinc-600 hover:text-zinc-950 transition-colors">
                  support.coreblock@gmail.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 mb-1">Phone (India)</p>
                <a href="tel:+919701341323" className="text-zinc-600 hover:text-zinc-950 transition-colors">
                  +91 9701341323
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-zinc-200">
            <p className="text-sm">
              We aim to respond to all inquiries within 24-48 business hours. Thank you for your patience 
              and for being a part of the CoreBlock community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
