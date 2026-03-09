'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Journal' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-zinc-200/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-lg font-semibold text-zinc-950 tracking-tight">
              CoreBlock
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${pathname === link.href
                      ? 'text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-950'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="h-4 w-px bg-zinc-200" />
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              Console
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-950 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200/50 bg-white/95 backdrop-blur-xl absolute w-full tracking-tight">
          <div className="px-4 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium ${pathname === link.href
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            >
              Console
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200/50 pt-16 pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="text-lg font-semibold text-zinc-950 tracking-tight">
                CoreBlock
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              A minimalist, high-performance blogging platform built for the modern web.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-zinc-950 font-medium text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Home</Link></li>
              <li><Link href="/blog" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Journal</Link></li>
              <li><Link href="/admin" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Console</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-zinc-950 font-medium text-sm mb-4">Technology</h3>
            <ul className="space-y-3">
              <li className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors cursor-default">Next.js</li>
              <li className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors cursor-default">Lexical</li>
              <li className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors cursor-default">Firebase</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} CoreBlock. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 text-xs font-medium">Systems Operational</span>
          </div>
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
    <div className="flex flex-col min-h-screen bg-zinc-50 selection:bg-zinc-200 selection:text-zinc-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
