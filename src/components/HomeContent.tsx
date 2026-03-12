'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { BlogPost } from '@/types/blog';

interface HomeContentProps {
    initialPosts: BlogPost[];
}

export default function HomeContent({ initialPosts }: HomeContentProps) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [loading, setLoading] = useState(initialPosts.length === 0);

    // Newsletter state
    const [email, setEmail] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [subscribeMessage, setSubscribeMessage] = useState('');

    useEffect(() => {
        // If we already have initial posts, don't fetch unless we want fresh data
        if (initialPosts.length > 0) {
            setLoading(false);
            return;
        }

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
    }, [initialPosts]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSubscribeStatus('loading');
        setSubscribeMessage('');

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubscribeStatus('success');
                setSubscribeMessage('Thank you for subscribing!');
                setEmail('');
            } else {
                setSubscribeStatus('error');
                setSubscribeMessage(data.error || 'Failed to subscribe. Please try again.');

                // Handle rate limit visually
                if (res.status === 429) {
                    setSubscribeMessage(data.error);
                }
            }
        } catch (err) {
            setSubscribeStatus('error');
            setSubscribeMessage('An unexpected error occurred.');
        }
    };

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
                    <a href="#newsletter" className="px-6 py-2.5 bg-white text-zinc-950 text-sm font-medium rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors">
                        Subscribe to Newsletter
                    </a>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Featured Post (Premium Heroic Layout) */}
                {featuredPost && (
                    <section className="animate-slide-up mb-24 md:mb-32" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="h-px flex-1 bg-zinc-200"></span>
                            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] px-4 whitespace-nowrap">Featured Story</h2>
                            <span className="h-px flex-1 bg-zinc-200"></span>
                        </div>

                        <Link href={`/blog/${featuredPost.slug}`} className="group block relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 transition-all hover:shadow-2xl hover:shadow-zinc-300/60 hover:-translate-y-1 duration-500">
                            <article className="grid lg:grid-cols-12 items-stretch min-h-[450px]">
                                {/* Image Section */}
                                <div className="lg:col-span-7 relative overflow-hidden bg-zinc-100 min-h-[300px] lg:min-h-full">
                                    {featuredPost.coverImage ? (
                                        <>
                                            <img src={featuredPost.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt={featuredPost.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-medium bg-zinc-50 uppercase tracking-widest text-sm">No Preview Image</div>
                                    )}
                                    {/* Category Badge over image on mobile */}
                                    <div className="absolute top-6 left-6 lg:hidden">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md border border-white/20 text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                            {featuredPost.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="lg:col-span-5 p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white">
                                    <div className="hidden lg:flex items-center gap-2 mb-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                        <span>{featuredPost.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                        <span>{featuredPost.readTime} min read</span>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-950 tracking-tight leading-[1.1] mb-6 group-hover:text-zinc-800 transition-colors">
                                        {featuredPost.title}
                                    </h3>

                                    <p className="text-zinc-500 text-lg leading-relaxed mb-10 line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>

                                    <div className="mt-auto border-t border-zinc-100 pt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-950 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-zinc-950/20">
                                                {featuredPost.author.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-zinc-950 leading-none mb-1">{featuredPost.author}</span>
                                                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                                                    {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-zinc-950 font-bold text-sm tracking-tight">
                                            Read Story <span className="transform group-hover:translate-x-2 transition-transform duration-300 text-xl leading-none">→</span>
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

                    <div className="flex flex-col gap-6">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex p-4 rounded-xl border border-zinc-200/60 items-center justify-between gap-6 overflow-hidden">
                                    <div className="flex items-center gap-6 w-full">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-100 rounded-2xl shrink-0"></div>
                                        <div className="flex-1 py-1 space-y-4">
                                            <div className="h-6 bg-zinc-100 rounded w-1/3"></div>
                                            <div className="h-4 bg-zinc-100 rounded w-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 gap-8">
                                        <div className="h-6 w-6 bg-zinc-100 rounded-full"></div>
                                        <div className="h-4 bg-zinc-100 rounded w-20"></div>
                                    </div>
                                </div>
                            ))
                        ) : recentPosts.length > 0 ? (
                            recentPosts.map((post, index) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group block animate-slide-up" style={{ animationDelay: `${(index + 2) * 50}ms` }}>
                                    <article className="flex gap-0 sm:gap-4 p-4 rounded-2xl border border-zinc-300 bg-white hover:border-zinc-400 focus:ring-4 focus:ring-blue-100 transition-all hover:shadow-sm overflow-hidden">
                                        {/* Fixed Square Image - Hidden on mobile */}
                                        <div className="hidden sm:flex w-32 h-32 overflow-hidden rounded-xl relative bg-zinc-100 shrink-0 border border-zinc-200/50">
                                            {post.coverImage ? (
                                                <img src={post.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-medium uppercase tracking-wider">No Image</div>
                                            )}
                                        </div>

                                        {/* Content Section spanning remaining width */}
                                        <div className="flex flex-col flex-1 min-w-0 py-0.5 sm:py-1 justify-between">
                                            {/* Top Row: Title & Heart aligned at ends */}
                                            <div className="flex justify-between items-start gap-2 sm:gap-4 mb-1.5 sm:mb-2 text-wrap">
                                                <h3 className="text-lg sm:text-2xl font-bold text-zinc-950 uppercase tracking-wide leading-tight group-hover:text-zinc-700 transition-colors line-clamp-2 pr-1 sm:pr-2">
                                                    {post.title}
                                                </h3>

                                                {/* Heart Icon Right-Aligned */}
                                                <div className="shrink-0 text-zinc-400 group-hover:text-rose-500 transition-colors cursor-pointer mt-0.5 sm:mt-1">
                                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Excerpt context - Hidden on mobile */}
                                            <p className="text-[13px] sm:text-sm text-zinc-500 leading-relaxed line-clamp-2 hidden sm:block pr-4 sm:pr-8">
                                                {post.excerpt}
                                            </p>

                                            {/* Bottom Row: Date Data & Read More Action */}
                                            <div className="flex items-end justify-between mt-auto pt-3 sm:pt-4">
                                                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="hidden sm:inline opacity-50">/</span>
                                                    <span className="hidden sm:inline">{post.category}</span>
                                                </div>

                                                <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-[15px] font-semibold text-zinc-950 group-hover:text-zinc-600 transition-colors whitespace-nowrap">
                                                    Read More <span className="transform group-hover:translate-x-1 transition-transform ml-0.5 sm:ml-1">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))
                        ) : (
                            <div className="py-12 px-6 border border-zinc-200/60 rounded-2xl bg-white text-center animate-fade-in">
                                <p className="text-zinc-500 font-medium">No other recent posts yet. Check back later!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Newsletter Section */}
            <section id="newsletter" className="bg-zinc-50 border-t border-zinc-200/50 py-24 px-4 sm:px-6 lg:px-8 text-center scroll-mt-0">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-3xl font-semibold text-zinc-950 tracking-tight mb-4">Subscribe to our Newsletter</h2>
                    <p className="text-lg text-zinc-500 mb-8">Get the latest articles, tutorials, and insights delivered straight to your inbox.</p>

                    <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 px-4 py-3 bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-sm"
                                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                            />
                            <button
                                type="submit"
                                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                                className="inline-flex items-center justify-center px-6 py-3 bg-zinc-950 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-75 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {subscribeStatus === 'loading' ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : subscribeStatus === 'success' ? (
                                    'Subscribed ✓'
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </div>

                        {/* Status Message Area */}
                        {subscribeMessage && (
                            <p className={`absolute -bottom-8 left-0 right-0 text-sm font-medium ${subscribeStatus === 'success' ? 'text-green-600' : 'text-red-500'
                                }`}>
                                {subscribeMessage}
                            </p>
                        )}
                    </form>
                </div>
            </section>
        </div>
    );
}
