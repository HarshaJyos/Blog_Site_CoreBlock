'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/AuthContext';
import { LoginModal } from '@/components/LoginModal';
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

  // Likes & Auth
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
        setLikeCount(data.likes || 0);

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

    async function checkLikeStatus() {
      if (!user || !params.slug) {
        setIsLiked(false);
        return;
      }
      try {
        const res = await fetch(`/api/blogs/${params.slug}/like?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked);
        }
      } catch (err) {
        console.error('Failed to check like status', err);
      }
    }

    if (params.slug) {
      fetchPost();
      checkLikeStatus();
    }
  }, [params.slug, user]);

  const handleToggleLike = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      const action = isLiked ? 'unlike' : 'like';

      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(prev => action === 'like' ? prev + 1 : Math.max(0, prev - 1));

      const res = await fetch(`/api/blogs/${params.slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, action })
      });

      if (!res.ok) {
        // Revert optimistic update on failure
        setIsLiked(isLiked);
        setLikeCount(prev => action === 'like' ? prev - 1 : prev + 1);
        throw new Error('Failed to toggle like');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLikeLoading(false);
    }
  };

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
      : new Date(post.publishedAt || post.createdAt).toISOString(),
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
          <header className="relative mb-2 rounded-2xl overflow-hidden bg-zinc-900 aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] border border-zinc-200/50 shadow-sm">
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
          <p className="text-md md:text-lg text-zinc-600 leading-relaxed font-normal">
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
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-lg shrink-0">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-900">{post.author}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-zinc-500 mt-1">
                  <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()}>{publishDate}</time>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 hidden sm:inline-block" />
                  <span className="hidden sm:inline-block">{post.readTime} min read</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>{post.category}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Like Button (Small) */}
            <div className="flex items-center gap-3 sm:pl-6 sm:border-l border-zinc-100">
              <button
                onClick={handleToggleLike}
                disabled={isLikeLoading}
                className={`group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-sm border disabled:opacity-50 disabled:cursor-not-allowed ${isLiked
                  ? 'bg-red-50 border-red-200 text-red-500 shadow-red-100'
                  : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                title={isLiked ? "Unlike this article" : "Like this article"}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isLiked ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`}
                  viewBox="0 0 24 24"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={isLiked ? "1.5" : "2"}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 leading-none">{likeCount}</span>
                <span className="text-xs text-zinc-500 mt-0.5">{likeCount === 1 ? 'Like' : 'Likes'}</span>
              </div>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Sign in to Like"
        subtitle="Join CoreBlock to save and like your favorite articles."
      />
    </article>
  );
}
