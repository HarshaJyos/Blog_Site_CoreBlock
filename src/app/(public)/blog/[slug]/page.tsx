'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { BlogPost } from '@/types/blog';

const ReadOnlyEditor = dynamic(() => import('@/components/ReadOnlyEditor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-6 py-12 max-w-3xl mx-auto">
      <div className="h-6 bg-zinc-100 rounded w-full"></div>
      <div className="h-6 bg-zinc-100 rounded w-5/6"></div>
      <div className="h-6 bg-zinc-100 rounded w-4/5"></div>
      <div className="h-6 bg-zinc-100 rounded w-full"></div>
      <div className="h-6 bg-zinc-100 rounded w-2/3"></div>
      <div className="h-32 bg-zinc-100 rounded w-full my-8"></div>
    </div>
  ),
});

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
  const [nextPost, setNextPost] = useState<BlogPost | null>(null);
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

        // Fetch prev/next posts
        const listRes = await fetch(`/api/blogs?status=published&pageSize=100`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const allBlogs = listData.blogs || [];
          const currentIndex = allBlogs.findIndex((b: BlogPost) => b.slug === params.slug);
          if (currentIndex !== -1) {
            setNextPost(currentIndex > 0 ? allBlogs[currentIndex - 1] : null);
            setPrevPost(currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null);
          }
        }
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
      <div className="min-h-screen bg-white pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-10 bg-zinc-100 rounded-md w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-12">
            <div className="h-4 bg-zinc-100 rounded w-24"></div>
            <div className="h-4 bg-zinc-100 rounded w-24"></div>
          </div>
          <div className="aspect-[2/1] bg-zinc-100 rounded-xl mb-16"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-white text-center">
        <h1 className="text-2xl font-semibold text-zinc-950 mb-3 tracking-tight">Post Not Found</h1>
        <p className="text-zinc-500 mb-8 max-w-md mx-auto">The article you're looking for might have been moved or deleted.</p>
        <Link href="/blog" className="text-sm font-medium text-zinc-900 border border-zinc-200 rounded-md px-6 py-2.5 hover:bg-zinc-50 transition-colors">
          Return to Journal
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

  const publishDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <article className="animate-fade-in bg-white min-h-screen pb-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto ">
        {/* Combined Header & Hero Banner */}
        {post.coverImage ? (
          <header className="relative mb-16 rounded-2xl overflow-hidden bg-zinc-900 aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] border border-zinc-200/50 shadow-sm">
            <img src={post.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt={post.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <Link href="/blog" className="inline-flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors">
                  ← Back to Journal
                </Link>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight drop-shadow-md">
                  {post.title}
                </h1>
              </div>
            </div>
          </header>
        ) : (
          <header className="mb-14">
            <div className="mb-10">
              <Link href="/blog" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors">
                ← Back to Journal
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-zinc-950 tracking-tight leading-tight">
              {post.title}
            </h1>
          </header>
        )}

        {/* Content container */}
        {post.excerpt && (
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed font-normal mb-4">
            {post.excerpt}
          </p>
        )}

        <div className="prose-clean">
          {post.content ? (
            <ReadOnlyEditor content={post.content} />
          ) : (
            <div className="py-20 text-center">
              <p className="text-zinc-500 text-lg">This article has no content yet.</p>
            </div>
          )}
        </div>

        {/* Post Metadata & Tags */}
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-lg">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-900">{post.author}</p>
                <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                  <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()}>{publishDate}</time>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>{post.readTime} min read</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>{post.category}</span>
                </div>
              </div>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-zinc-400 mr-2 flex items-center">Tagged in:</span>
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Minimalist Post Navigation */}
        <div className="mt-24 pt-8 border-t border-zinc-200/50 flex flex-col sm:flex-row justify-between gap-8">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className="group flex flex-col max-w-[50%]">
              <span className="text-xs font-medium text-zinc-500 mb-2">Previous</span>
              <span className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-2">
                {prevPost.title}
              </span>
            </Link>
          ) : <div className="max-w-[50%]" />}

          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="group flex flex-col max-w-[50%] text-right sm:items-end">
              <span className="text-xs font-medium text-zinc-500 mb-2">Next</span>
              <span className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-2">
                {nextPost.title}
              </span>
            </Link>
          ) : <div className="max-w-[50%]" />}
        </div>
      </div>
    </article>
  );
}
