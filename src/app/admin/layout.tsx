'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/AdminGuard';

const sidebarLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/blogs',
    label: 'All Posts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    href: '/admin/blogs/new',
    label: 'New Post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/admin/blogs/trash',
    label: 'Trash',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950 text-white flex flex-col z-40">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-zinc-800">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <span className="text-white font-black text-base">C</span>
              </div>
              <span className="text-lg font-bold">
                Core<span className="text-zinc-400">Block</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 mt-1">Admin Panel</p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${isActive
                    ? 'bg-zinc-800/80 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-zinc-800 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View Site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-zinc-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-zinc-900">
                {pathname === '/admin' && 'Dashboard'}
                {pathname === '/admin/blogs' && 'All Posts'}
                {pathname === '/admin/blogs/new' && 'Create New Post'}
                {pathname === '/admin/blogs/trash' && 'Trash'}
                {pathname.includes('/edit') && 'Edit Post'}
              </h1>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/blogs/new"
                  className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-smooth shadow-sm"
                >
                  + New Post
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
