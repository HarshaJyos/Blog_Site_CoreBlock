import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const reqBody = await request.json();
        const userId = reqBody.userId;
        const action = reqBody.action;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: User ID required.' }, { status: 401 });
        }

        // 1. Find the Blog Document ID by Slug
        const q = query(collection(db, 'blogs'), where('slug', '==', params.slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        const blogDoc = snapshot.docs[0];
        const blogRef = doc(db, 'blogs', blogDoc.id);

        // 2. Reference the user's specific like document in the subcollection
        const likeRef = doc(db, 'blogs', blogDoc.id, 'likes', userId);

        // 3. Since we don't know if they liked it without reading (or relying on client state),
        // let's check if the like document exists.
        // However, a better pattern is passing the intent from the client (isLiked), 
        // or we can just fetch the sub-doc to toggle.

        // If client provides intent 'like' or 'unlike', we force it. Otherwise we toggle based on DB.
        // For simplicity, we assume client sends "action": "like" | "unlike"

        const likeSnap = await getDoc(likeRef);

        if (action === 'like') {
            if (!likeSnap.exists()) {
                await setDoc(likeRef, {
                    createdAt: Date.now(),
                    userId,
                    blogId: blogDoc.id,
                    slug: params.slug
                });
                await updateDoc(blogRef, { likes: increment(1) });
            }
            return NextResponse.json({ success: true, liked: true });
        } else if (action === 'unlike') {
            if (likeSnap.exists()) {
                await deleteDoc(likeRef);
                // To prevent negative likes just in case
                const currentLikes = blogDoc.data().likes || 0;
                await updateDoc(blogRef, { likes: currentLikes > 0 ? increment(-1) : 0 });
            }

            return NextResponse.json({ success: true, liked: false });
        }

        return NextResponse.json({ error: 'Invalid action specified. Must be "like" or "unlike".' }, { status: 400 });
    } catch (error: any) {
        console.error(`Error toggling like for ${params.slug}:`, error);
        return NextResponse.json(
            { error: 'Failed to toggle like', message: error.message },
            { status: 500 }
        );
    }
}

// GET route to check if a specific user has liked this post
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ liked: false });
        }

        const q = query(collection(db, 'blogs'), where('slug', '==', params.slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ liked: false });
        }

        const blogDoc = snapshot.docs[0];

        const { getDoc } = await import('firebase/firestore');
        const likeRef = doc(db, 'blogs', blogDoc.id, 'likes', userId);
        const likeSnap = await getDoc(likeRef);

        return NextResponse.json({ liked: likeSnap.exists() });
    } catch (error: any) {
        console.error(`Error checking like status for ${params.slug}:`, error);
        return NextResponse.json({ liked: false });
    }
}
