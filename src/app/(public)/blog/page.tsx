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
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-50 to-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-navy-950 mb-2">Blog</h1>
          <p className="text-navy-500 text-lg">Explore articles on technology, design, and development</p>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent text-navy-800 placeholder-navy-300 transition-smooth"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                activeCategory === 'All'
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              All
            </button>
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  activeCategory === cat
                    ? 'bg-navy-700 text-white shadow-sm'
                    : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-navy-100/30 overflow-hidden animate-pulse">
                <div className="aspect-video bg-navy-100"></div>
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-navy-100 rounded w-20"></div>
                  <div className="h-5 bg-navy-100 rounded w-full"></div>
                  <div className="h-4 bg-navy-50 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="bg-white rounded-2xl border border-navy-100/30 overflow-hidden shadow-card hover:shadow-card-hover transition-smooth h-full flex flex-col">
                  {post.coverImage ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center">
                      <span className="text-4xl font-black text-navy-200">CB</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="tag-chip">{post.category}</span>
                      <span className="text-xs text-navy-400">{post.readTime} min read</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-950 group-hover:text-navy-700 transition-colors mb-2 leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-navy-500 leading-relaxed line-clamp-2 flex-1 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-navy-400 pt-4 border-t border-navy-50">
                      <span>{post.author}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-navy-700 mb-2">No posts found</h3>
            <p className="text-navy-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </section>
    </div>
  );
}
