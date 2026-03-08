'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { BlogPost } from '@/types/blog';

const ReadOnlyEditor = dynamic(() => import('@/components/ReadOnlyEditor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4 py-8">
      <div className="h-4 bg-navy-100 rounded w-full"></div>
      <div className="h-4 bg-navy-100 rounded w-5/6"></div>
      <div className="h-4 bg-navy-50 rounded w-3/4"></div>
      <div className="h-4 bg-navy-100 rounded w-full"></div>
      <div className="h-4 bg-navy-50 rounded w-2/3"></div>
    </div>
  ),
});

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blogs/${params.slug}`);
        if (!res.ok) {
          setError('Post not found');
          return;
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    if (params.slug) fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-8 bg-navy-100 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-navy-50 rounded w-1/3 mb-8"></div>
        <div className="aspect-video bg-navy-100 rounded-2xl mb-8"></div>
        <div className="space-y-3">
          <div className="h-4 bg-navy-100 rounded w-full"></div>
          <div className="h-4 bg-navy-50 rounded w-5/6"></div>
          <div className="h-4 bg-navy-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Post Not Found</h1>
        <p className="text-navy-500 mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/blog" className="inline-flex items-center px-5 py-2.5 bg-navy-700 text-white rounded-xl font-medium hover:bg-navy-800 transition-smooth">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: post.coverImage || post.seo?.ogImage,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'CoreBlock',
    },
  };

  return (
    <article className="animate-fade-in">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-gradient-to-b from-navy-50 to-white pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-navy-400 mb-6">
            <Link href="/" className="hover:text-navy-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-navy-600 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-navy-600 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Category & Read time */}
          <div className="flex items-center gap-3 mb-4">
            <span className="tag-chip">{post.category}</span>
            <span className="text-sm text-navy-400">{post.readTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-navy-950 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-navy-500 leading-relaxed mb-6 max-w-3xl">
              {post.excerpt}
            </p>
          )}

          {/* Author & Date */}
          <div className="flex items-center gap-4 text-sm text-navy-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy-200 flex items-center justify-center">
                <span className="text-navy-700 font-bold text-xs">
                  {post.author?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>
              <span className="font-medium text-navy-700">{post.author}</span>
            </div>
            <span>·</span>
            <span>
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full rounded-2xl shadow-card object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="blog-content">
          {post.content ? (
            <ReadOnlyEditor content={post.content} />
          ) : (
            <p className="text-navy-400 italic">No content available.</p>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-navy-100">
            <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wider mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-navy-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-50 text-navy-700 font-medium rounded-xl hover:bg-navy-100 transition-smooth"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    </article>
  );
}
