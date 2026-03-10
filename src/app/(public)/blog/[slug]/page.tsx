import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import BlogDetailContent from '@/components/BlogDetailContent';
import type { BlogPost } from '@/types/blog';
import { Suspense } from 'react';

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const q = query(collection(db, 'blogs'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
  } catch (err) {
    console.error('Error fetching post:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const seo = post.seo || {};
  const title = seo.metaTitle || post.title;
  const description = seo.metaDescription || post.excerpt;
  const ogImage = seo.ogImage || post.coverImage;

  return {
    title,
    description,
    keywords: seo.keywords || post.tags || [],
    robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: seo.canonicalUrl || `https://coreblock.app/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: new Date(post.publishedAt || post.createdAt).toISOString(),
      authors: [post.author || 'Hanish Jyosyabhatla'],
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = post.seo?.structuredData
    ? JSON.parse(post.seo.structuredData)
    : {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "image": post.coverImage,
      "datePublished": new Date(post.publishedAt || post.createdAt).toISOString(),
      "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
      "author": {
        "@type": "Person",
        "name": post.author,
        "url": "https://coreblock.app"
      },
      "description": post.excerpt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://coreblock.app/blog/${post.slug}`
      }
    };

  let jsonLdString = "";
  try {
    jsonLdString = typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd);
  } catch (err) {
    console.error("Error stringifying JSON-LD:", err);
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-10 bg-zinc-100 rounded-md w-3/4 mb-6"></div>
          <div className="aspect-[2/1] bg-zinc-100 rounded-xl"></div>
        </div>
      </div>
    }>
      {jsonLdString && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
      )}
      <BlogDetailContent initialPost={post} />
    </Suspense>
  );
}
