import { NextResponse } from 'next/server';
import { collection, doc, getDoc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Simple in-memory rate limiting map for edge environments where we can't easily hit Firestore for every request
// 1000 * 60 = 1 minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map<string, number>();

function cleanUpRateLimitMap() {
    const now = Date.now();
    for (const [key, timestamp] of rateLimitMap.entries()) {
        if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
            rateLimitMap.delete(key);
        }
    }
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Valid email address is required.' },
                { status: 400 }
            );
        }

        // Basic email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        // Extract IP Address for rate limiting
        // Fallback to purely IP-less string if headers are missing
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown-ip';

        // Create a unique identifier for rate limiting (ip + email to be strict)
        const rateLimitKey = `${ip}-${email}`;
        const now = Date.now();

        // Clean up old entries periodically
        if (rateLimitMap.size > 1000) {
            cleanUpRateLimitMap();
        }

        // Check rate limit map
        const lastRequest = rateLimitMap.get(rateLimitKey);
        if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
            return NextResponse.json(
                { error: 'Please wait 1 minute before subscribing again.' },
                { status: 429 }
            );
        }

        // 1. Double check Firestore to ensure they haven't ALREADY subscribed
        // We use the email (cleaned up) as the document ID to allow secure GET lookups
        const emailDocId = email.toLowerCase().replace(/[^a-z0-9@.]/g, '_');
        const docRef = doc(db, 'newsletter', emailDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            rateLimitMap.set(rateLimitKey, now);
            return NextResponse.json(
                { error: 'You are already subscribed to the newsletter!' },
                { status: 400 }
            );
        }

        // 2. Add to Firestore 'newsletter' collection using the email ID
        await setDoc(docRef, {
            email,
            subscribedAt: serverTimestamp(),
            ipAddress: ip === 'unknown-ip' ? null : ip
        });

        // 3. Update rate limit map on success
        rateLimitMap.set(rateLimitKey, now);

        return NextResponse.json(
            { message: 'Successfully subscribed' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while subscribing.' },
            { status: 500 }
        );
    }
}
