'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-navy-100/50 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-hero-pattern flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight">
              Core<span className="text-navy-500">Block</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  pathname === link.href
                    ? 'bg-navy-50 text-navy-700'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold bg-navy-700 text-white hover:bg-navy-800 transition-smooth shadow-sm hover:shadow-md"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navy-100/50 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-navy-50 text-navy-700'
                    : 'text-navy-600 hover:bg-navy-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-navy-700 text-white text-center mt-2"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-400 to-accent-500 flex items-center justify-center">
                <span className="text-white font-black text-base">C</span>
              </div>
              <span className="text-lg font-bold text-white">
                Core<span className="text-navy-300">Block</span>
              </span>
            </div>
            <p className="text-navy-400 text-sm leading-relaxed">
              A modern blog platform built for creators and developers. Publish beautiful content with our powerful rich text editor.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-navy-400 text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/blog" className="text-navy-400 text-sm hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/admin" className="text-navy-400 text-sm hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Built With</h3>
            <ul className="space-y-2 text-sm text-navy-400">
              <li>Next.js</li>
              <li>Lexical Editor</li>
              <li>Firebase & Firestore</li>
              <li>TailwindCSS</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy-500 text-sm">
            © {new Date().getFullYear()} CoreBlock. All rights reserved.
          </p>
          <p className="text-navy-600 text-xs">
            Powered by Lexical Rich Text Editor
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
