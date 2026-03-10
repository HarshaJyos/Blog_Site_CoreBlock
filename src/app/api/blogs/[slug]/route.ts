import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

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

// Helper: find blog document by slug
async function findBlogBySlug(slug: string) {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const blogDoc = snapshot.docs[0];
  return { id: blogDoc.id, ref: blogDoc.ref, data: { id: blogDoc.id, ...blogDoc.data() } };
}

// GET /api/blogs/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await findBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog.data);
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[slug]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await findBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const body = await request.json();

    // Sanitize body: remove undefined values which Firestore rejects
    const sanitizedBody = Object.keys(body).reduce((acc: any, key) => {
      if (body[key] !== undefined) {
        acc[key] = body[key];
      }
      return acc;
    }, {});

    const updateData: any = {
      ...sanitizedBody,
      updatedAt: Date.now(),
    };

    console.log('UPDATING BLOG:', slug);
    if (sanitizedBody.content) {
      await syncPolls(sanitizedBody.content);
    }

    // Handle published date
    if (sanitizedBody.publishedAt) {
      updateData.publishedAt = new Date(sanitizedBody.publishedAt).getTime();
    } else if (body.status === 'published' && !(blog.data as any).publishedAt) {
      updateData.publishedAt = Date.now();
    } else if (sanitizedBody.publishedAt === '') {
      updateData.publishedAt = null;
    }

    // Recalculate read time if content changed
    if (body.content) {
      const wordCount = body.content.split(/\s+/).length;
      updateData.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    await updateDoc(blog.ref, updateData);

    return NextResponse.json({ id: blog.id, ...updateData });
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[slug]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await findBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    await deleteDoc(blog.ref);

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog', message: error.message },
      { status: 500 }
    );
  }
}
