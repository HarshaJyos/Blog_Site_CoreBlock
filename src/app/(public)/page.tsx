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
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-navy-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-navy-100 mb-6 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse-soft"></span>
              Welcome to CoreBlock
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
              Ideas that shape the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                future
              </span>
            </h1>
            <p className="text-lg md:text-xl text-navy-200 leading-relaxed mb-8 max-w-2xl">
              Discover insightful articles on technology, design, and development. 
              Built with a powerful rich text editor for a premium reading experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="px-6 py-3 bg-white text-navy-900 font-semibold rounded-xl hover:bg-navy-50 transition-smooth shadow-lg hover:shadow-xl"
              >
                Read Blog
              </Link>
              <Link
                href="/admin"
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-smooth backdrop-blur-sm border border-white/20"
              >
                Start Writing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-16">
          <Link href={`/blog/${featuredPost.slug}`} className="block group">
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-smooth overflow-hidden border border-navy-100/30">
              <div className="grid md:grid-cols-2 gap-0">
                {featuredPost.coverImage ? (
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video md:aspect-auto bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                    <span className="text-6xl font-black text-navy-300">CB</span>
                  </div>
                )}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-navy-50 text-navy-600 text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
                    Featured
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-navy-950 group-hover:text-navy-700 transition-colors mb-3 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-navy-600 leading-relaxed mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-navy-400">
                    <span>{featuredPost.author}</span>
                    <span>·</span>
                    <span>{featuredPost.readTime} min read</span>
                    <span>·</span>
                    <span>{new Date(featuredPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Recent Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-950">Recent Posts</h2>
            <p className="text-navy-500 mt-1">Latest articles from our blog</p>
          </div>
          <Link
            href="/blog"
            className="text-navy-600 hover:text-navy-800 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
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
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-navy-700 mb-2">No posts yet</h3>
            <p className="text-navy-400 mb-6">Start creating amazing content with our editor</p>
            <Link
              href="/admin/blogs/new"
              className="inline-flex items-center px-5 py-2.5 bg-navy-700 text-white font-medium rounded-xl hover:bg-navy-800 transition-smooth"
            >
              Create your first post
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-navy-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to share your ideas?
          </h2>
          <p className="text-navy-300 text-lg mb-8 max-w-2xl mx-auto">
            Use our powerful rich text editor to create stunning blog posts. 
            Embed images, code, videos, tables, and more.
          </p>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-navy-500 to-accent-600 text-white font-semibold rounded-xl hover:from-navy-600 hover:to-accent-700 transition-smooth shadow-lg hover:shadow-xl"
          >
            Start Writing
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
