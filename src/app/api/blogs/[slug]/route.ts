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
} from 'firebase/firestore';

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

    const updateData: any = {
      ...body,
      updatedAt: Date.now(),
    };

    // If publishing for the first time
    if (body.status === 'published' && !(blog.data as any).publishedAt) {
      updateData.publishedAt = Date.now();
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
