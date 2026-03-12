'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BLOG_CATEGORIES, type BlogPost, type BlogPostFormData } from '@/types/blog';
import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';

const LexicalEditorStep = dynamic(() => import('@/components/AdminEditor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-8">
      <div className="h-6 bg-slate-100 rounded w-48 mb-4"></div>
      <div className="h-96 bg-slate-50 rounded-lg"></div>
    </div>
  ),
});

const STEPS = ['Blog Details', 'Content Editor', 'SEO Settings'];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blogId, setBlogId] = useState('');

  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    coverImage: '',
    author: 'CoreBlock',
    category: 'Technology',
    tags: [],
    status: 'draft',
    seo: {
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogImage: '',
      keywords: [],
      structuredData: '',
      noIndex: false,
    },
    publishedAt: '',
  });

  const [editorContent, setEditorContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blogs/${params.slug}`);
        if (!res.ok) {
          setError('Post not found');
          return;
        }
        const data: BlogPost = await res.json();
        setBlogId(data.id);
        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          coverImage: data.coverImage,
          author: data.author,
          category: data.category,
          tags: data.tags || [],
          status: data.status,
          seo: data.seo || {
            metaTitle: '',
            metaDescription: '',
            canonicalUrl: '',
            ogImage: '',
            keywords: [],
            structuredData: '',
            noIndex: false,
          },
          publishedAt: data.publishedAt
            ? new Date(data.publishedAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
            : '',
        });
        setEditorContent(data.content || '');
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    if (params.slug) fetchPost();
  }, [params.slug]);

  const updateTitle = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      seo: { ...prev.seo, metaTitle: prev.seo.metaTitle || title },
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        seo: { ...prev.seo, keywords: [...prev.seo.keywords, keywordInput.trim()] },
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, keywords: prev.seo.keywords.filter((k) => k !== keyword) },
    }));
  };

  const handleEditorChange = useCallback((content: string) => {
    setEditorContent(content);
  }, []);

  const handleSave = async (status: 'draft' | 'published') => {
    setSaving(true);
    setError('');
    try {
      const syncPolls = async (content: string) => {
        try {
          const contentJson = JSON.parse(content);
          const polls: any[] = [];
      
          const findPolls = (nodes: any[]) => {
            for (const node of nodes) {
              if (node.type === 'poll') {
                polls.push(node);
              }
              if (node.children) findPolls(node.children);
            }
          };
      
          if (contentJson.root && contentJson.root.children) {
            findPolls(contentJson.root.children);
          }
      
          for (const poll of polls) {
            const pollRef = doc(db, 'polls', poll.pollId);
            const pollSnap = await getDoc(pollRef);
      
            if (!pollSnap.exists()) {
              console.log('SYNC: Creating missing poll in Firestore:', poll.pollId);
              await setDoc(pollRef, {
                question: poll.question,
                options: {},
                totalVotes: 0,
                createdAt: poll.createdAt || Date.now(),
                lastSyncAt: Date.now(),
              });
            }
          }
        } catch (e) {
          console.error('Error syncing polls:', e);
        }
      };

      const wordCount = (editorContent || '').split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      const updateData: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: editorContent,
        coverImage: formData.coverImage,
        author: formData.author,
        category: formData.category,
        tags: formData.tags,
        status,
        seo: {
          ...formData.seo,
          metaTitle: formData.seo.metaTitle || formData.title,
          metaDescription: formData.seo.metaDescription || formData.excerpt,
          ogImage: formData.seo.ogImage || formData.coverImage,
        },
        readTime,
        updatedAt: Date.now(),
      };

      if (formData.publishedAt) {
        updateData.publishedAt = new Date(formData.publishedAt).getTime();
      } else if (status === 'published' && !formData.publishedAt) {
        updateData.publishedAt = Date.now();
      } else if (formData.publishedAt === '') {
        updateData.publishedAt = null;
      }

      await updateDoc(doc(db, 'blogs', blogId), updateData);
      
      if (editorContent) {
        await syncPolls(editorContent);
      }

      router.push('/admin/blogs');
    } catch (err: any) {
      console.error('Error saving blog:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
        <div className="h-96 bg-slate-50 rounded-2xl border border-slate-200"></div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setCurrentStep(index)}
                className="flex items-center gap-2 z-10 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-smooth ${index === currentStep
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${index === currentStep ? 'text-zinc-900' : 'text-slate-400'
                  }`}>
                  {step}
                </span>
              </button>
              {index < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-4 rounded bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Blog Details */}
      {currentStep === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-scale-in">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Blog Details</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Title</label>
              <input type="text" value={formData.title} onChange={(e) => updateTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">/blog/</span>
                <input type="text" value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Excerpt</label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Cover Image URL</label>
              <input type="url" value={formData.coverImage} onChange={(e) => setFormData((p) => ({ ...p, coverImage: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
              {formData.coverImage && <img src={formData.coverImage} alt="Cover preview" className="mt-3 w-full h-48 object-cover rounded-xl border border-slate-200" />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Author</label>
                <input type="text" value={formData.author} onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Category</label>
                <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth bg-white">
                  {BLOG_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Published Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Publish Date</label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, publishedAt: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth"
                />
                <p className="text-xs text-zinc-500 mt-1">Leave empty to auto-set when published.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Tags</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 placeholder-slate-300 transition-smooth text-sm" />
                <button type="button" onClick={addTag} className="px-4 py-2.5 bg-zinc-50 text-zinc-700 rounded-xl font-medium text-sm hover:bg-zinc-100 transition-smooth">Add</button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="tag-chip">{tag}<button onClick={() => removeTag(tag)} className="ml-1.5 text-zinc-400 hover:text-red-500">×</button></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Content Editor */}
      {currentStep === 1 && (
        <div className="animate-scale-in">
          <LexicalEditorStep initialContent={editorContent} onChange={handleEditorChange} />
        </div>
      )}

      {/* Step 3: SEO Settings */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-scale-in">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">SEO Settings</h2>
          <p className="text-sm text-zinc-500 mb-6">Optimize your post for search engines</p>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Meta Title</label>
              <input type="text" value={formData.seo.metaTitle} onChange={(e) => setFormData((p) => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))} placeholder={formData.title} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
              <p className="text-xs text-zinc-400 mt-1">{(formData.seo.metaTitle || formData.title).length}/60 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Meta Description</label>
              <textarea value={formData.seo.metaDescription} onChange={(e) => setFormData((p) => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))} placeholder={formData.excerpt} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth resize-none" />
              <p className="text-xs text-zinc-400 mt-1">{(formData.seo.metaDescription || formData.excerpt).length}/160 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Canonical URL</label>
              <input type="url" value={formData.seo.canonicalUrl} onChange={(e) => setFormData((p) => ({ ...p, seo: { ...p.seo, canonicalUrl: e.target.value } }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">OG Image URL</label>
              <input type="url" value={formData.seo.ogImage} onChange={(e) => setFormData((p) => ({ ...p, seo: { ...p.seo, ogImage: e.target.value } }))} placeholder={formData.coverImage} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 transition-smooth" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">SEO Keywords</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())} placeholder="Add a keyword..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-800 placeholder-slate-300 transition-smooth text-sm" />
                <button type="button" onClick={addKeyword} className="px-4 py-2.5 bg-zinc-50 text-zinc-700 rounded-xl font-medium text-sm hover:bg-zinc-100 transition-smooth">Add</button>
              </div>
              {formData.seo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.seo.keywords.map((kw) => (
                    <span key={kw} className="tag-chip">{kw}<button onClick={() => removeKeyword(kw)} className="ml-1.5 text-zinc-400 hover:text-red-500">×</button></span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.seo.noIndex}
                    onChange={(e) => setFormData(p => ({ ...p, seo: { ...p.seo, noIndex: e.target.checked } }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                </div>
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">Hide from search engines (noindex)</span>
              </label>
              <p className="text-xs text-zinc-400 mt-2 ml-14">Check this if you don't want this post to appear in Google search results.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5 flex items-center gap-2">
                Custom Structured Data (JSON-LD)
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Advanced</span>
              </label>
              <textarea
                value={formData.seo.structuredData}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, seo: { ...p.seo, structuredData: e.target.value } }))
                }
                placeholder='{ "@context": "https://schema.org", "@type": "TechArticle", ... }'
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent text-zinc-800 placeholder-slate-300 transition-smooth font-mono text-xs"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Optional: Override the default BlogPosting schema with your own custom JSON-LD.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-6">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">Search Preview</h3>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-blue-700 text-lg font-medium truncate">{formData.seo.metaTitle || formData.title || 'Page Title'}</p>
                <p className="text-green-700 text-sm truncate mt-0.5">coreblock.com/blog/{formData.slug || 'post-url'}</p>
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">{formData.seo.metaDescription || formData.excerpt || 'Meta description...'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pb-8">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <div className="flex gap-3">
          {currentStep === STEPS.length - 1 ? (
            <>
              <button onClick={() => handleSave('draft')} disabled={saving} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-smooth disabled:opacity-50">
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button onClick={() => handleSave('published')} disabled={saving} className="px-6 py-2.5 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-smooth shadow-sm disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="px-6 py-2.5 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-smooth shadow-sm"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
