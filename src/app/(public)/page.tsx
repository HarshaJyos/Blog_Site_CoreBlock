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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-medium">
                      {featuredPost.author.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{featuredPost.author}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[3/2] bg-zinc-100 rounded-lg"></div>
                  <div className="h-4 bg-zinc-100 rounded w-1/4"></div>
                  <div className="h-6 bg-zinc-100 rounded w-full"></div>
                  <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              recentPosts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block animate-slide-up" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                  <article>
                    <div className="aspect-[3/2] rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200/50 mb-6">
                      {post.coverImage ? (
                        <img src={post.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm">No Image</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300" />
                      <span>{post.category}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-950 tracking-tight leading-snug mb-3 group-hover:text-zinc-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
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
