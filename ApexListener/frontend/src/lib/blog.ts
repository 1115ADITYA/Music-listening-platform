import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  ogImage?: string;
  readTime: string;
  contentHtml?: string;
}

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

function calculateReadTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const defaultSlug = fileName.replace(/\.(md|mdx)$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const slug = data.slug || defaultSlug;

      return {
        slug,
        title: data.title || 'Untitled Post',
        description: data.description || '',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        author: data.author || 'ApexListener Team',
        tags: data.tags || [],
        ogImage: data.ogImage || data.image || '/icon.png',
        readTime: calculateReadTime(content),
      } as BlogPost;
    });

  // Sort posts by date descending
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const targetFile = fileNames.find((fileName) => {
    const defaultSlug = fileName.replace(/\.(md|mdx)$/, '');
    if (defaultSlug === slug) return true;
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return data.slug === slug;
  });

  if (!targetFile) {
    return null;
  }

  const fullPath = path.join(postsDirectory, targetFile);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const contentHtml = await marked.parse(content);

  return {
    slug,
    title: data.title || 'Untitled Post',
    description: data.description || '',
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    author: data.author || 'ApexListener Team',
    tags: data.tags || [],
    ogImage: data.ogImage || data.image || '/icon.png',
    readTime: calculateReadTime(content),
    contentHtml,
  };
}

export function getAllPostSlugs(): string[] {
  const posts = getAllPosts();
  return posts.map((post) => post.slug);
}
