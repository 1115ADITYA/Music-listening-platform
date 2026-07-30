import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog & Articles | ApexListener',
  description:
    'Guides, updates, and articles on synchronized video playback, YouTube watch parties, real-time tech, and community features.',
  openGraph: {
    title: 'ApexListener Blog — Guides & Updates',
    description:
      'Guides, updates, and articles on synchronized video playback, YouTube watch parties, and real-time tech.',
    url: 'https://apexlistener.dev/blog',
    siteName: 'ApexListener',
    type: 'website',
  },
};

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-[#080d08] text-[#f0f4f0]">
      <Navbar />

      <main className="flex-1 section-padding">
        <div className="page-container">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <div className="live-badge w-fit mb-4">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              ARTICLES & UPDATES
            </div>

            <h1 className="heading-font text-4xl sm:text-6xl mb-4" style={{ color: 'var(--text-primary)' }}>
              ApexListener <span style={{ color: 'var(--accent-teal)' }}>Blog</span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/70 leading-relaxed">
              Explore guides, product releases, and behind-the-scenes engineering of frame-accurate synchronized YouTube watch parties.
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="feature-card p-12 text-center rounded-2xl">
              <p className="text-lg text-emerald-100/60">No blog posts found yet. Drop markdown files in <code className="text-teal-400">/content/blog</code> to publish!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group feature-card p-6 lg:p-7 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0f1710]/80 hover:bg-[#141f14] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/20"
                >
                  <div>
                    {/* Meta info bar */}
                    <div className="flex items-center gap-4 text-xs text-[#7a9b7a] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="heading-font text-2xl mb-3 text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-[#7a9b7a] leading-relaxed line-clamp-3 mb-6">
                      {post.description}
                    </p>
                  </div>

                  {/* Read More button */}
                  <div className="flex items-center text-sm font-semibold text-emerald-400 group-hover:translate-x-1.5 transition-transform">
                    Read article <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#4a6b4a]">
        <div className="page-container">
          © {new Date().getFullYear()} ApexListener. Watch YouTube videos together in real-time.
        </div>
      </footer>
    </div>
  );
}
