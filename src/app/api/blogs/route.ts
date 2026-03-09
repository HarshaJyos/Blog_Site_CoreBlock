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
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import type { BlogPost } from '@/types/blog';

// Helper to sync polls from blog content to firestore
async function syncPolls(content: string) {
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

    // Upsert each poll found
    for (const poll of polls) {
      const pollRef = doc(db, 'polls', poll.pollId);
      const pollSnap = await getDoc(pollRef);

      if (!pollSnap.exists()) {
        console.log('SYNC: Creating missing poll in Firestore:', poll.pollId);
        await setDoc(pollRef, {
          question: poll.question,
          options: {}, // Results are stored as { [optionUid]: count }
          totalVotes: 0,
          createdAt: poll.createdAt || Date.now(),
          lastSyncAt: Date.now(),
        });
      }
    }
  } catch (e) {
    console.error('Error syncing polls:', e);
  }
}


// GET /api/blogs — list blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const lastDocId = searchParams.get('lastDocId');

    let q = query(collection(db, 'blogs'));

    const snapshot = await getDocs(q);
    let blogs: BlogPost[] = [];

    snapshot.forEach((docSnap) => {
      blogs.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as BlogPost);
    });

    if (status) {
      blogs = blogs.filter(b => b.status === status);
    }
    if (category && category !== 'All Topic' && category !== 'All') {
      blogs = blogs.filter(b => b.category === category);
    }

    blogs.sort((a, b) => b.createdAt - a.createdAt);

    let startIndex = 0;
    if (lastDocId) {
      const idx = blogs.findIndex(b => b.id === lastDocId);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    const paginatedBlogs = blogs.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      blogs: paginatedBlogs,
      hasMore: startIndex + pageSize < blogs.length,
      lastDocId: paginatedBlogs.length > 0 ? paginatedBlogs[paginatedBlogs.length - 1].id : null,
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

    console.log('CREATING NEW BLOG:', slug);
    if (blogData.content) {
      try {
        const contentJson = JSON.parse(blogData.content);
        let hasImageWithCaption = false;

        const checkNodes = (nodes: any[]) => {
          for (const node of nodes) {
            if (node.type === 'image' && node.caption) {
              hasImageWithCaption = true;
              console.log('FOUND IMAGE WITH CAPTION IN NEW BLOG PAYLOAD:', {
                src: node.src,
                captionState: !!node.caption.editorState
              });
            }
            if (node.children) checkNodes(node.children);
          }
        };

        if (contentJson.root && contentJson.root.children) {
          checkNodes(contentJson.root.children);
        }

        if (!hasImageWithCaption) {
          console.log('NO IMAGE WITH CAPTION FOUND IN NEW BLOG PAYLOAD');
        }
      } catch (e) {
        console.error('Failed to parse content JSON for debug:', e);
      }
    }

    const docRef = await addDoc(collection(db, 'blogs'), blogData);

    // Sync polls after saving blog
    if (blogData.content) {
      await syncPolls(blogData.content);
    }


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
