import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Lock, EyeOff, Server, BarChart3, Hash } from 'lucide-react';
import { LogoIcon } from '@/components/LogoIcon';

export const metadata: Metadata = {
  title: 'Privacy Policy | ApexListener',
  description: 'Learn how ApexListener respects your privacy, tracks room codes for synchronization, uses privacy-friendly Vercel Analytics, and handles user data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header className="nav-glass sticky top-0 z-50">
        <div className="page-container h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Return to ApexListener home">
            <LogoIcon className="h-8 w-auto" />
            <span className="font-bold text-lg sm:text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ApexListener
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Us
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <section className="flex-1 py-12 sm:py-16">
        <div className="page-container max-w-4xl">
          {/* Header Title */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--accent-teal)' }}>
              <Shield className="w-3.5 h-3.5" /> Privacy First & Transparent
            </div>
            <h1 className="heading-font text-4xl sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Last updated: August 2026
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid sm:grid-cols-4 gap-4 mb-12">
            <div className="feature-card p-5">
              <EyeOff className="w-6 h-6 mb-3" style={{ color: 'var(--accent-teal)' }} />
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>No Accounts</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Watch rooms require zero sign-up or accounts.
              </p>
            </div>
            <div className="feature-card p-5">
              <Hash className="w-6 h-6 mb-3" style={{ color: 'var(--accent-teal)' }} />
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Room Codes Only</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We track unique Room Codes to connect and sync participants.
              </p>
            </div>
            <div className="feature-card p-5">
              <BarChart3 className="w-6 h-6 mb-3" style={{ color: 'var(--accent-teal)' }} />
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Vercel Analytics</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Anonymous, privacy-friendly site performance metrics.
              </p>
            </div>
            <div className="feature-card p-5">
              <Lock className="w-6 h-6 mb-3" style={{ color: 'var(--accent-teal)' }} />
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Zero Data Sales</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We never sell your data or track cross-site activity.
              </p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {/* 1. Overview */}
            <div className="feature-card p-6 sm:p-8 space-y-4">
              <h2 className="heading-font text-2xl" style={{ color: 'var(--text-primary)' }}>
                1. Overview & Philosophy
              </h2>
              <p>
                At <strong>ApexListener</strong>, we believe media watch parties should be privacy-focused, anonymous, and effortless. You do not need to register an account or share personal information to enjoy sub-second YouTube video sync with friends.
              </p>
            </div>

            {/* 2. What We Collect & Track */}
            <div className="feature-card p-6 sm:p-8 space-y-4">
              <h2 className="heading-font text-2xl" style={{ color: 'var(--text-primary)' }}>
                2. Information We Process, Collect & Track
              </h2>
              <p>We keep data processing to the absolute minimum required to operate the service. Here is everything we handle:</p>
              
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Room Codes & Synchronization State:</strong> We generate and track unique <strong>Room Codes</strong> (e.g. 6-character alphanumeric identifiers) to route active participants to the same virtual room. Inside a room, we track temporary Socket IDs, guest display names, YouTube video URLs/IDs, playback timestamps, and in-room chat messages in volatile server RAM. When a room closes, this session state is destroyed.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Vercel Analytics:</strong> We use <strong>Vercel Analytics</strong> (`@vercel/analytics`) to collect aggregated, non-identifiable usage statistics (such as pageview counts, device types, and performance metrics). Vercel Analytics is strictly privacy-preserving — it does <strong>NOT</strong> log IP addresses, use tracking cookies, or build personal profiles across websites.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Contact Form Submissions (`/contact`):</strong> If you send us a message via the Contact page, we collect your <strong>Email Address</strong> and <strong>Issue Message</strong> strictly to respond to your support request. IP addresses are temporarily cached in server memory to prevent spam (enforcing a rate limit of max 5 messages per hour).
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>YouTube Player Integration:</strong> Video streams are embedded directly via YouTube&apos;s iframe API. Interacting with the video player is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white" style={{ color: 'var(--accent-teal)' }}>Google&apos;s Privacy Policy</a>.
                </li>
              </ul>
            </div>

            {/* 3. Data Storage & Retention */}
            <div className="feature-card p-6 sm:p-8 space-y-4">
              <h2 className="heading-font text-2xl" style={{ color: 'var(--text-primary)' }}>
                3. Data Storage & Retention
              </h2>
              <p>
                Room codes, video playback states, and room chat logs exist only in volatile server memory (RAM) while room members are connected. Once all users leave, the room state is cleared automatically.
              </p>
              <p>
                Support emails submitted through `/contact` are sent directly to our support inbox via SMTP and retained only for as long as necessary to answer your inquiry.
              </p>
            </div>

            {/* 4. Cookies & Tracking */}
            <div className="feature-card p-6 sm:p-8 space-y-4">
              <h2 className="heading-font text-2xl" style={{ color: 'var(--text-primary)' }}>
                4. Cookies & Client-Side Storage
              </h2>
              <p>
                ApexListener does not use third-party advertising cookies or cross-site tracking pixels. Browser Local Storage is used solely for non-sensitive client preferences (such as saving your preferred guest nickname on your device).
              </p>
            </div>

            {/* 5. Contact Section */}
            <div className="feature-card p-6 sm:p-8 border border-teal-500/20 text-center space-y-4" style={{ background: 'rgba(45, 212, 191, 0.03)' }}>
              <Mail className="w-10 h-10 mx-auto" style={{ color: 'var(--accent-teal)' }} />
              <h2 className="heading-font text-2xl" style={{ color: 'var(--text-primary)' }}>
                Have Questions or Support Requests?
              </h2>
              <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
                If you have any questions regarding our Privacy Policy, room code tracking, or technical support, please contact us.
              </p>
              <div className="pt-2">
                <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Go to Contact Form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-7 sm:py-8 text-[14px] border-t" style={{ borderColor: 'var(--border-card)' }}>
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-7 w-auto" />
            <span className="font-medium text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              ApexListener &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
