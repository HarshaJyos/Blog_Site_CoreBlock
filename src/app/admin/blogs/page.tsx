'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BlogPost } from '@/types/blog';

export default function AdminBlogsList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

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

  async function handleDelete(slug: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(slug);
    try {
      await fetch(`/api/blogs/${slug}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">All Posts ({posts.length})</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-50 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-50 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-50 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-50 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-navy-300">CB</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-navy-900 truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-navy-400 truncate max-w-xs">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="tag-chip">{post.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${post.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                          }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-500">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-smooth"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/blogs/${post.slug}/edit`}
                          className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-smooth"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          disabled={deleting === post.slug}
                          className="p-2 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition-smooth disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-navy-600 font-medium mb-1">No posts found</p>
                    <p className="text-navy-400 text-sm mb-4">Create your first blog post</p>
                    <Link
                      href="/admin/blogs/new"
                      className="inline-flex items-center px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition-smooth"
                    >
                      + New Post
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
