import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CoreBlock | Minimalist Blogging Platform',
  description: 'Learn about CoreBlock, a minimalist, high-performance blogging platform designed for creators to share ideas without distractions.',
  openGraph: {
    title: 'About CoreBlock | Minimalist Blogging Platform',
    description: 'Learn about CoreBlock, a minimalist, high-performance blogging platform designed for creators to share ideas without distractions.',
    url: 'https://coreblock.in/about',
    siteName: 'CoreBlock',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-950 mb-8">About CoreBlock</h1>
      
      <div className="prose prose-zinc max-w-none text-zinc-600">
        <p className="text-lg leading-relaxed mb-6">
          CoreBlock is a minimalist, high-performance blogging platform built for the modern web. 
          Our mission is to provide creators with a clean, fast, and elegant space to share their 
          ideas with the world.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-900 mt-12 mb-4">Our Vision</h2>
        <p className="mb-6 leading-relaxed">
          We believe that reading and writing on the web should be a distraction-free experience. 
          CoreBlock strips away the noise, focusing entirely on typography, readability, and speed.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-900 mt-12 mb-4">Technology</h2>
        <p className="mb-6 leading-relaxed">
          Built with cutting-edge tools like Next.js for server-side rendering and static generation, 
          and Lexical for a robust, extensible editing experience. CoreBlock is designed to be as 
          fast as it is beautiful.
        </p>
      </div>
    </div>
  );
}
