'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { BlogPost } from '@/types/blog';

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blogs?status=published&pageSize=6');
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

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <div className="animate-fade-in bg-white min-h-screen">
      {/* Minimalist Hero */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-semibold text-zinc-950 tracking-tight leading-tight mb-8 animate-slide-up">
          Writing about code, design, <br className="hidden md:block" /> and the systems we build.
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl font-normal leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          An open journal exploring the intersections of software engineering, digital craftsmanship, and the modern web.
        </p>
        <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link href="/blog" className="px-6 py-2.5 bg-zinc-950 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors">
            Read the Journal
          </Link>
          <Link href="/admin/blogs/new" className="px-6 py-2.5 bg-white text-zinc-950 text-sm font-medium rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors">
            Start Writing
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Featured Post (Clean Layout) */}
        {featuredPost && (
          <section className="animate-slide-up mb-24 md:mb-32" style={{ animationDelay: '300ms' }}>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">Featured</h2>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <article className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/50">
                  {featuredPost.coverImage ? (
                    <img src={featuredPost.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={featuredPost.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 font-medium">No Image</div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mb-4">
                    <span>{new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span>{featuredPost.readTime} min read</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-zinc-950 tracking-tight leading-tight mb-4 group-hover:text-zinc-600 transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-medium">
                        {featuredPost.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                      <span className="flex items-center gap-1.5" title="Views">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {featuredPost.views || 0}
                      </span>
                      <span className="flex items-center gap-1.5" title="Likes">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {featuredPost.likes || 0}
                      </span>
                      <span className="flex items-center gap-1.5" title="Comments">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {featuredPost.commentCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {/* Latest feed (Unboxed List) */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-10 border-b border-zinc-200/50 pb-4">
            <h2 className="text-lg font-semibold text-zinc-950 tracking-tight">Recent Posts</h2>
            <Link href="/blog" className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors">
              View all →
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-zinc-200/50">
                  <div className="w-full sm:w-[28%] md:w-1/4 aspect-[16/9] sm:aspect-[4/3] bg-zinc-100 rounded-lg shrink-0"></div>
                  <div className="flex-1 py-1 space-y-4">
                    <div className="h-4 bg-zinc-100 rounded w-1/4"></div>
                    <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-100 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : (
              recentPosts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block animate-slide-up" style={{ animationDelay: `${(index + 2) * 50}ms` }}>
                  <article className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-zinc-200/60 bg-white hover:border-zinc-300 transition-colors hover:shadow-sm">
                    <div className="w-full sm:w-[28%] md:w-1/4 aspect-[16/9] sm:aspect-[4/3] rounded-lg overflow-hidden relative bg-zinc-100 shrink-0">
                      {post.coverImage ? (
                        <img src={post.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-medium">No Image</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-1 flex flex-col">
                      <div className="flex items-center gap-3 text-[13px] font-medium text-zinc-500 mb-2.5">
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span>{post.category}</span>
                      </div>

                      <h3 className="text-xl font-semibold text-zinc-950 tracking-tight leading-snug mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[13px] font-medium text-zinc-500">
                          <span className="flex items-center gap-1.5" title="Views">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1.5" title="Likes">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1.5" title="Comments">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {post.commentCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-zinc-950 font-semibold group-hover:text-zinc-600 transition-colors">
                          Read <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Clean Light CTA */}
      <section className="bg-zinc-50 border-t border-zinc-200/50 py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold text-zinc-950 tracking-tight mb-4">Start publishing today.</h2>
          <p className="text-lg text-zinc-500 mb-8">Join the platform and share your knowledge with a community of builders.</p>
          <Link href="/admin/blogs/new" className="inline-flex items-center justify-center px-6 py-2.5 bg-zinc-950 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors">
            Create an Entry
          </Link>
        </div>
      </section>
    </div>
  );
}
