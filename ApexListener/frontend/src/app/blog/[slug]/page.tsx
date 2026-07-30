import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | ApexListener',
    };
  }

  return {
    title: `${post.title} | ApexListener Blog`,
    description: post.description,
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://apexlistener.dev/blog/${post.slug}`,
      siteName: 'ApexListener',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: post.ogImage ? [{ url: post.ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080d08] text-[#f0f4f0]">
      <Navbar />

      <main className="flex-1 section-padding">
        <article className="page-container max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to all articles
          </Link>

          {/* Article Header */}
          <header className="mb-10 border-b border-white/10 pb-8">
            <h1 className="heading-font text-3xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#7a9b7a]">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{post.author}</span>
                </div>
              )}
              {post.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{post.date}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-[#4a6b4a]" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Body */}
          <div
            className="prose-apex"
            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
          />

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <a
              href="https://apexlistener.dev"
              className="btn-support text-xs"
            >
              Try ApexListener Free
            </a>
          </div>
        </article>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#4a6b4a] mt-12">
        <div className="page-container">
          © {new Date().getFullYear()} ApexListener. Watch YouTube videos together in real-time.
        </div>
      </footer>
    </div>
  );
}
