'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import { BLOG_CATEGORIES, type BlogPost } from '@/types/blog';

function BlogListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // URL Params
  const currentPage = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || 'All';

  // Input states (for immediate feedback before URL sync)
  const [searchInput, setSearchInput] = useState(search);

  // Handle URL updates
  const updateURL = useCallback((params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'page' && value === '1') || (key === 'category' && value === 'All')) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.push(`?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Debounce search input to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        updateURL({ search: searchInput, page: '1' });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, search, updateURL]);

  // Sync searchInput with URL if it changes (e.g. browser back)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch posts when dependencies change
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          status: 'published',
          pageSize: '9',
          page: currentPage.toString(),
          category: activeCategory,
          search: search
        });
        const res = await fetch(`/api/blogs?${query.toString()}`);
        const data = await res.json();
        setPosts(data.blogs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [currentPage, activeCategory, search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateURL({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`animate-fade-in bg-white min-h-screen ${isFilterOpen ? 'overflow-hidden' : ''}`}>
      {/* Header */}
      <section className="pt-5 pb-5 md:pt-5 md:pb-5 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-200/50">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-zinc-950 tracking-tight leading-tight mb-2 animate-slide-up">
            Journal Archive
          </h1>
          <p className="text-lg text-zinc-500 font-normal leading-relaxed mb-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Thoughts, tutorials, and insights on software engineering and design.
          </p>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent text-zinc-900 placeholder-zinc-400 text-sm transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm text-zinc-700 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Filter</span>
              {activeCategory !== 'All' && (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950"></span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Side Filter Drawer (Amazon Style) */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
        />

        {/* Drawer */}
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-950">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { updateURL({ category: 'All', page: '1' }); setIsFilterOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeCategory === 'All'
                      ? 'bg-zinc-950 text-white font-bold'
                      : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 font-medium'}`}
                  >
                    <span>All Articles</span>
                    {activeCategory === 'All' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  {BLOG_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { updateURL({ category: cat, page: '1' }); setIsFilterOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeCategory === cat
                        ? 'bg-zinc-950 text-white font-bold'
                        : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 font-medium'}`}
                    >
                      <span>{cat}</span>
                      {activeCategory === cat && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
              <button
                onClick={() => { updateURL({ search: null, category: null, page: '1' }); setIsFilterOpen(false); }}
                className="w-full py-4 text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-widest"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {loading ? (
          <div className="flex flex-col gap-6">
            {[...Array(5)].map((_, i) => (
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
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6 transition-all duration-300">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group animate-slide-up block"
                  style={{ animationDelay: `${(index % 4) * 40}ms` }}
                >
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
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-zinc-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5 px-4 font-bold text-sm tracking-widest text-zinc-400">
                  <span className="text-zinc-950">{currentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 border border-zinc-200 border-dashed rounded-lg max-w-2xl mx-auto px-4">
            <h3 className="text-xl font-semibold text-zinc-950 mb-2 tracking-tight">No results</h3>
            <p className="text-zinc-500 mb-6 text-sm">
              We couldn't find any articles matching your search criteria.
            </p>
            <button
              onClick={() => updateURL({ search: null, category: null, page: '1' })}
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

export default function BlogListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white py-24 px-4">
        <div className="max-w-5xl mx-auto animate-pulse bg-zinc-50 rounded-3xl h-[600px]"></div>
      </div>
    }>
      <BlogListingContent />
    </Suspense>
  );
}
