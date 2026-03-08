'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blogs?pageSize=100');
        const data = await res.json();
        setPosts(data.blogs || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const stats = [
    {
      label: 'Total Posts',
      value: posts.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'bg-navy-50 text-navy-600',
    },
    {
      label: 'Published',
      value: publishedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Drafts',
      value: draftCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">
                {loading ? '—' : stat.value}
              </p>
              <p className="text-sm text-navy-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/blogs/new"
            className="px-5 py-2.5 bg-navy-700 text-white font-medium rounded-xl hover:bg-navy-800 transition-smooth shadow-sm"
          >
            Create New Post
          </Link>
          <Link
            href="/admin/blogs"
            className="px-5 py-2.5 bg-navy-50 text-navy-700 font-medium rounded-xl hover:bg-navy-100 transition-smooth"
          >
            Manage Posts
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-5 py-2.5 bg-slate-50 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-smooth"
          >
            View Site ↗
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-navy-900">Recent Posts</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-3 bg-slate-50 rounded w-20 ml-auto"></div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.slice(0, 5).map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 truncate">{post.title}</p>
                  <p className="text-xs text-navy-400 mt-0.5">
                    {post.category} · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {post.status}
                  </span>
                  <Link
                    href={`/admin/blogs/${post.slug}/edit`}
                    className="text-navy-400 hover:text-navy-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-navy-400">
              No posts yet. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
