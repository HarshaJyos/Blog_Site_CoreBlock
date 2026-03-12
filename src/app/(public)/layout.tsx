'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { LoginModal } from '@/components/LoginModal';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
            <img src="/logo.png" alt="CoreBlock" className="h-8 w-auto transition-transform group-hover:scale-105" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
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

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-4 w-px bg-zinc-200" />
            {!user ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-medium px-4 py-2 bg-zinc-950 text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  Account
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
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
            <div className="pt-2 pb-1 border-t border-zinc-100 mt-2">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-left block px-3 py-2.5 rounded-md text-sm font-medium text-zinc-950 hover:bg-zinc-50"
                >
                  Login
                </button>
              ) : (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    Account Context
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
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
              <li><Link href="/account" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Account</Link></li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h3 className="text-zinc-950 font-medium text-sm mb-4">Legal & Info</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/contact" className="text-zinc-500 text-sm hover:text-zinc-950 transition-colors">Contact</Link></li>
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
