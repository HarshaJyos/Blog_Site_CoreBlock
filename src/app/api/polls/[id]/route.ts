import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
} from 'firebase/firestore';

// GET /api/polls/[id] - fetch poll results
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const docRef = doc(db, 'polls', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return NextResponse.json(docSnap.data());
        } else {
            // Return empty results if poll hasn't been voted on yet
            return NextResponse.json({
                totalVotes: 0,
                options: {},
            });
        }
    } catch (error: any) {
        console.error('Error fetching poll:', error);
        return NextResponse.json(
            { error: 'Failed to fetch poll', message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/polls/[id] - handle various actions (currently just voting)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Handle Vote action
        if (body.action === 'vote') {
            const { optionUid, createdAt } = body;

            if (!optionUid) {
                return NextResponse.json({ error: 'Option UID is required' }, { status: 400 });
            }

            // Check expiration (24 hours)
            const now = Date.now();
            const pollCreatedAt = createdAt || now;
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (now - pollCreatedAt > twentyFourHours) {
                return NextResponse.json(
                    { error: 'Poll has expired', expired: true },
                    { status: 403 }
                );
            }

            const docRef = doc(db, 'polls', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Initialize poll document if first vote or synchronized late
                await setDoc(docRef, {
                    totalVotes: 1,
                    options: {
                        [optionUid]: 1,
                    },
                    createdAt: pollCreatedAt,
                    lastVoteAt: serverTimestamp(),
                });
            } else {
                // Update existing counts
                await updateDoc(docRef, {
                    totalVotes: increment(1),
                    [`options.${optionUid}`]: increment(1),
                    lastVoteAt: serverTimestamp(),
                });
            }

            // Fetch updated data to return
            const updatedSnap = await getDoc(docRef);
            return NextResponse.json(updatedSnap.data());
        }

        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    } catch (error: any) {
        console.error('Error in poll action:', error);
        return NextResponse.json(
            { error: 'Failed to process poll action', message: error.message },
            { status: 500 }
        );
    }
}
