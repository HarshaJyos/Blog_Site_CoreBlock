import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDoc,
  doc,
} from 'firebase/firestore';
import type { BlogPost } from '@/types/blog';

// GET /api/blogs — list blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const lastDocId = searchParams.get('lastDocId');

    let q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));

    if (status) {
      q = query(q, where('status', '==', status));
    }
    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (lastDocId) {
      const lastDoc = await getDoc(doc(db, 'blogs', lastDocId));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc), limit(pageSize));
      }
    } else {
      q = query(q, limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const blogs: BlogPost[] = [];

    snapshot.forEach((docSnap) => {
      blogs.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as BlogPost);
    });

    return NextResponse.json({
      blogs,
      hasMore: blogs.length === pageSize,
      lastDocId: blogs.length > 0 ? blogs[blogs.length - 1].id : null,
    });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/blogs — create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Estimate read time from content
    const wordCount = (body.content || '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const blogData = {
      title: body.title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || '',
      author: body.author || 'CoreBlock',
      category: body.category || 'Uncategorized',
      tags: body.tags || [],
      status: body.status || 'draft',
      seo: body.seo || {
        metaTitle: body.title,
        metaDescription: body.excerpt || '',
        canonicalUrl: '',
        ogImage: body.coverImage || '',
        keywords: body.tags || [],
      },
      readTime,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: body.status === 'published' ? Date.now() : null,
    };

    const docRef = await addDoc(collection(db, 'blogs'), blogData);

    return NextResponse.json(
      { id: docRef.id, slug, ...blogData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog', message: error.message },
      { status: 500 }
    );
  }
}
