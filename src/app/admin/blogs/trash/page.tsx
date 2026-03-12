'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BlogPost } from '@/types/blog';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminTrashList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDeletedPosts();
  }, []);

  async function fetchDeletedPosts() {
    try {
      const q = query(collection(db, 'blogs'), where('status', '==', 'trash'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[];
      setPosts(data.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      console.error('Failed to fetch deleted posts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(id: string) {
    if (!confirm('Are you sure you want to restore this post? It will be marked as a draft.')) return;
    setProcessing(id);
    try {
      await updateDoc(doc(db, 'blogs', id), {
        status: 'draft',
        updatedAt: Date.now(),
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to restore:', err);
    } finally {
      setProcessing(null);
    }
  }

  async function handlePermanentDelete(id: string) {
    if (!confirm('WARNING: Are you sure you want to PERMANENTLY delete this post? This action cannot be undone.')) return;
    setProcessing(id);
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to permanently delete:', err);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Trash ({posts.length})</h2>
          <Link
            href="/admin/blogs"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to Posts
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Deleted Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-50 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-50 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-50 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 opacity-70">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 grayscale"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-zinc-400">CB</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-xs">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="tag-chip opacity-70">{post.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(post.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(post.id)}
                          disabled={processing === post.id}
                          className="px-3 py-1.5 rounded-lg text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition-smooth border border-emerald-100 disabled:opacity-50"
                          title="Restore to Draft"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(post.id)}
                          disabled={processing === post.id}
                          className="px-3 py-1.5 rounded-lg text-red-600 font-medium text-sm hover:bg-red-50 transition-smooth border border-red-100 disabled:opacity-50"
                          title="Permanently Delete"
                        >
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <p className="text-zinc-900 font-medium mb-1">Trash is empty</p>
                    <p className="text-zinc-500 text-sm mb-4">No recently deleted posts</p>
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
