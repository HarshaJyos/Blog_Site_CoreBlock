'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BLOG_CATEGORIES, type BlogPost } from '@/types/blog';

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blogs?status=published&pageSize=50');
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

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in bg-white min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-200/50">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-zinc-950 tracking-tight leading-tight mb-6 animate-slide-up">
            Journal Archive
          </h1>
          <p className="text-lg text-zinc-500 font-normal leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Thoughts, tutorials, and insights on software engineering and design.
          </p>

          {/* Search & Filter Controls */}
          <div className="flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-zinc-900 placeholder-zinc-400 text-sm transition-shadow"
              />
            </div>

            <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide border-b border-zinc-100">
              <button
                onClick={() => setActiveCategory('All')}
                className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 ${activeCategory === 'All'
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-zinc-950'
                  }`}
              >
                All
              </button>
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 ${activeCategory === cat
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-950'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex flex-col gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col sm:flex-row gap-6 p-4 rounded-xl border border-zinc-200/50">
                <div className="w-full sm:w-1/3 md:w-1/4 aspect-[16/9] sm:aspect-[4/3] bg-zinc-100 rounded-lg shrink-0" />
                <div className="flex-1 py-2 space-y-4">
                  <div className="h-4 bg-zinc-100 rounded w-1/4" />
                  <div className="h-6 bg-zinc-100 rounded w-3/4" />
                  <div className="h-4 bg-zinc-100 rounded w-full" />
                  <div className="flex h-4 gap-4 mt-auto">
                    <div className="w-10 bg-zinc-100 rounded" />
                    <div className="w-10 bg-zinc-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group animate-slide-up block"
                style={{ animationDelay: `${(index % 4) * 40}ms` }}
              >
                <article className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-zinc-200/60 bg-white hover:border-zinc-300 transition-colors hover:shadow-sm">
                  <div className="hidden sm:block sm:w-[28%] md:w-1/4 aspect-[4/3] overflow-hidden rounded-lg relative bg-zinc-100 shrink-0">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium text-zinc-300">No Image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[13px] font-medium text-zinc-500 mb-2.5">
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300" />
                      <span>{post.category}</span>
                    </div>

                    <h3 className="text-xl font-semibold text-zinc-950 mb-2 leading-snug tracking-tight group-hover:text-zinc-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[13px] font-medium text-zinc-500">
                        <span className="flex items-center gap-1.5" title="Likes">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {post.likes || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-zinc-950 font-semibold group-hover:text-zinc-600 transition-colors">
                        Read <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-zinc-200 border-dashed rounded-lg max-w-2xl mx-auto px-4">
            <h3 className="text-xl font-semibold text-zinc-950 mb-2 tracking-tight">No results</h3>
            <p className="text-zinc-500 mb-6 text-sm">
              We couldn't find any articles matching your search criteria.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="px-4 py-2 bg-zinc-100 text-zinc-950 text-sm font-medium rounded hover:bg-zinc-200 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
