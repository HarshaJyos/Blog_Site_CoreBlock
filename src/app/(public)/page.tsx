import { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import type { BlogPost } from '@/types/blog';

export const revalidate = 60; // Revalidate page every 60 seconds

export const metadata: Metadata = {
  title: "CoreBlock — Writing about Code, Design, and AI",
  description: "An open journal by Hanish Jyosyabhatla exploring software engineering, AI, and digital craftsmanship in his own words.",
  openGraph: {
    title: "CoreBlock — AI & Tech Journal by Hanish Jyosyabhatla",
    description: "Insights into AI, Agents, and modern development by Hanish Jyosyabhatla.",
  }
};

async function getInitialPosts() {
  try {
    // Note: Simple query to avoid complex indexes for now, sorting in memory
    const q = query(collection(db, 'blogs'));
    const snapshot = await getDocs(q);

    let blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];

    // Filter and Sort like the API does
    blogs = blogs.filter(b => b.status === 'published');
    blogs.sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt));

    let featuredPost: BlogPost | null = null;
    try {
      const featuredSnap = await getDoc(doc(db, 'featured', 'current'));
      if (featuredSnap.exists()) {
        const featuredId = featuredSnap.data().blogId;
        const matchingIndex = blogs.findIndex(b => b.id === featuredId);
        if (matchingIndex !== -1) {
          featuredPost = blogs.splice(matchingIndex, 1)[0];
        }
      }
    } catch (err) {
      console.error('Error fetching featured post:', err);
    }

    if (featuredPost) {
      return [featuredPost, ...blogs.slice(0, 5)];
    }

    return blogs.slice(0, 6);
  } catch (err) {
    console.error('Error fetching initial posts:', err);
    return [];
  }
}

export default async function HomePage() {
  const initialPosts = await getInitialPosts();

  return <HomeContent initialPosts={initialPosts} />;
}
