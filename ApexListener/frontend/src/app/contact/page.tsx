'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import { LogoIcon } from '@/components/LogoIcon';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [issue, setIssue] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch(`${backendUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, issue }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Unable to send your message.');

      setStatus('success');
      setMessage('Message sent. We will reply to the email address you provided.');
      setEmail('');
      setIssue('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <header className="nav-glass">
        <div className="page-container h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Return to ApexListener home">
            <LogoIcon className="h-8 w-auto" />
            <span className="font-bold text-lg sm:text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>ApexListener</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center py-14 sm:py-20">
        <div className="page-container w-full max-w-4xl">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 lg:gap-10 items-start">
            <div className="pt-2">
              <p className="eyebrow">Contact support</p>
              <h1 className="heading-font text-5xl sm:text-6xl" style={{ color: 'var(--text-primary)' }}>We&apos;re here to help.</h1>
              <p className="mt-6 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Tell us what went wrong or what you need. Include as much detail as you can, and we&apos;ll reply to your email.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-9 h-9 rounded-full inline-flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--accent-teal)' }}>
                  <Mail className="w-4 h-4" />
                </span>
                Your email is only used to respond to this request.
              </div>
            </div>

            <div className="feature-card p-6 sm:p-8">
              {status === 'success' ? (
                <div className="min-h-[330px] flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-12 h-12 mb-5" style={{ color: 'var(--accent-teal)' }} />
                  <h2 className="heading-font text-3xl" style={{ color: 'var(--text-primary)' }}>Message received</h2>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{message}</p>
                  <button onClick={() => setStatus('idle')} className="btn-primary mt-7">Send another message</button>
                </div>
              ) : (
                <form onSubmit={submitContactForm} className="space-y-5">
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your email address</label>
                    <input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={254} autoComplete="email" className="field px-4 py-3" />
                  </div>
                  <div>
                    <label htmlFor="contact-issue" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>How can we help?</label>
                    <textarea id="contact-issue" value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Describe your issue or question…" required minLength={10} maxLength={2000} rows={7} className="field px-4 py-3 resize-y" />
                    <p className="mt-2 text-xs text-right" style={{ color: 'var(--text-muted)' }}>{issue.length}/2000</p>
                  </div>
                  {status === 'error' && <p role="alert" className="text-sm" style={{ color: 'var(--accent-orange)' }}>{message}</p>}
                  <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center">
                    {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {status === 'sending' ? 'Sending message…' : 'Send message'}
                  </button>
                </form>
              )}
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
