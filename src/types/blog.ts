export interface BlogSEO {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  keywords: string[];
  structuredData?: string;
  noIndex?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Lexical serialized JSON state
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'trash';
  seo: BlogSEO;
  createdAt: number; // Unix timestamp ms
  updatedAt: number;
  publishedAt: number | null;
  readTime: number; // estimated minutes
  views: number;
  likes: number;
  commentCount: number;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'trash';
  seo: BlogSEO;
  publishedAt?: string;
}

export const BLOG_CATEGORIES = [
  'Technology',
  'Design',
  'Development',
  'Business',
  'Marketing',
  'Tutorial',
  'News',
  'Opinion',
] as const;
