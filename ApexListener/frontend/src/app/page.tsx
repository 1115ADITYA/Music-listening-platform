'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ArrowRight, Loader2, Zap, Users, ListMusic, Plus, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { LogoIcon } from '@/components/LogoIcon';

/* ─────────────────────────────────────────
   FAQ DATA
───────────────────────────────────────── */
const faqs = [
  {
    q: 'Is ApexListener free to use?',
    a: 'Yes — completely free. Create rooms, invite friends, and watch together with no paywalls or hidden costs.',
  },
  {
    q: 'Do I need an account to watch together?',
    a: "No account required. When you join a room you're auto-assigned a colour-coded guest name. No sign-up screen, ever.",
  },
  {
    q: 'How many people can join a room?',
    a: 'Currently up to 20 simultaneous viewers per room. We keep sub-second sync even at maximum capacity.',
  },
  {
    q: 'How is this different from Watch2Gether or Teleparty?',
    a: 'ApexListener syncs at the frame level, not just the timestamp. Nobody falls behind on a slow connection — we lock everyone to the same frame and resync automatically.',
  },
];

function BrowserMockup() {
  return (
    <div className="browser-mockup w-full ml-auto" style={{ maxWidth: 'min(480px, 100%)' }} aria-hidden="true">
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-card)', background: 'var(--bg-surface)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span
          className="ml-3 text-xs rounded-md px-3 py-1 flex-1"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', letterSpacing: '0.02em' }}
        >
          apexlistener.dev/room/8F2K-QP
        </span>
      </div>

      {/* Video area with clean top spacing */}
      <div className="p-4 pt-4">
        {/* Watching badge */}
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 mb-3 mt-1"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}
        >
          <span className="live-dot" />
          3 WATCHING
        </div>

        {/* Video placeholder */}
        <div
          className="relative w-full rounded-md flex items-center justify-center"
          style={{ aspectRatio: '16/9', background: 'var(--bg-surface)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3.5 progress-bar">
          <div className="progress-fill">
            <div className="progress-thumb">
              <span className="thumb-dot" style={{ background: 'var(--accent-teal)' }} />
              <span className="thumb-dot" style={{ background: 'var(--accent-gold)' }} />
            </div>
          </div>
        </div>

        {/* Time + viewers */}
        <div
          className="flex justify-between mt-2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>04:12 / 11:47</span>
          <span>3 viewers · same frame</span>
        </div>
      </div>

      {/* Queue */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="queue-row active">
          <span className="text-xs" style={{ color: 'var(--accent-orange)', minWidth: 14 }}>▶</span>
          <div className="track-thumb" />
          <span>Now playing — synced for all</span>
        </div>
        <div className="queue-row">
          <span className="text-xs" style={{ color: 'var(--text-muted)', minWidth: 14 }}>2</span>
          <div className="track-thumb" />
          <span>Added by guest-teal</span>
        </div>
        <div className="queue-row">
          <span className="text-xs" style={{ color: 'var(--text-muted)', minWidth: 14 }}>3</span>
          <div className="track-thumb" />
          <span>Added by guest-gold</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      label: 'CREATE',
      title: 'Start a Room',
      desc: 'One click generates a private room and a shareable code — no account, no setup screen.',
      color: 'var(--accent-orange)',
    },
    {
      num: '02',
      label: 'SHARE',
      title: 'Send the Link',
      desc: 'Friends join instantly as guests with an auto-generated name and color. Nobody signs up.',
      color: 'var(--accent-orange)',
    },
    {
      num: '03',
      label: 'WATCH',
      title: 'Press Play, Together',
      desc: 'Playback locks to the same frame for every viewer, even across slow connections.',
      color: 'var(--accent-orange)',
    },
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="page-container">
        <div className="section-header-mb">
          <p className="eyebrow">Three Steps</p>
          <h2 className="heading-font text-4xl sm:text-5xl" style={{ color: 'var(--text-primary)', lineHeight: 1.05 }}>
            From Link to Watch Party in Seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {steps.map((step) => (
            <div key={step.num} className="step-card p-6 lg:p-7">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-extrabold" style={{ color: step.color }}>{step.num} /</span>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: step.color }}>{step.label}</span>
              </div>
              <h3 className="heading-font text-2xl lg:text-3xl mb-3 mt-1" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="section-padding">
      <div className="page-container">
        <div className="section-header-mb">
          <p className="eyebrow">Features</p>
          <h2 className="heading-font text-4xl sm:text-5xl" style={{ color: 'var(--text-primary)', lineHeight: 1.05 }}>
            Built for Real Watch Parties
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* No sign-up card */}
          <div className="feature-card p-6 lg:p-7 flex flex-col justify-between">
            <div>
              {/* Graphic wrapper with fixed height for 100% title symmetry */}
              <div className="h-[68px] flex items-center mb-6">
                <div className="flex gap-2.5">
                  {['#ff4d2d','#2dd4bf','#f0b429'].map((c, i) => (
                    <span
                      key={c}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                      style={{ background: c }}
                    >
                      {['GT', 'RM', 'JL'][i]}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="heading-font text-2xl lg:text-3xl mb-3" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>No Sign-Up Required</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Every guest gets a random color-coded identity the moment they open the link. Zero friction.
              </p>
            </div>
          </div>

          {/* Queue card */}
          <div className="feature-card p-6 lg:p-7 flex flex-col justify-between">
            <div>
              {/* Graphic wrapper with fixed height for 100% title symmetry */}
              <div className="h-[68px] flex flex-col justify-center mb-6">
                <div
                  className="rounded-lg overflow-hidden w-full"
                  style={{ border: '1px solid var(--border-card)', background: 'rgba(0,0,0,0.3)' }}
                >
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium"
                    style={{ borderBottom: '1px solid rgba(255,77,45,0.25)', background: 'rgba(255,77,45,0.08)', color: 'var(--text-primary)' }}
                  >
                    <Play className="w-3 h-3 fill-current" style={{ color: 'var(--accent-orange)' }} />
                    01 — Now playing
                    <ListMusic className="w-3 h-3 ml-auto" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="px-3 py-1 text-xs flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>02 — Up next</span>
                  </div>
                </div>
              </div>
              <h3 className="heading-font text-2xl lg:text-3xl mb-3" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>Shared Queue</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Anyone in the room can add, reorder, or skip tracks. Collaborative control, live.
              </p>
            </div>
          </div>

          {/* Sync card */}
          <div className="feature-card p-6 lg:p-7 flex flex-col justify-between">
            <div>
              {/* Graphic wrapper with fixed height for 100% title symmetry */}
              <div className="h-[68px] flex flex-col justify-center mb-6">
                <div
                  className="text-3xl font-extrabold mb-2"
                  style={{ color: 'var(--accent-teal)', fontFamily: 'monospace' }}
                >
                  &lt;200ms
                </div>
                <div className="progress-bar" style={{ height: 3 }}>
                  <div className="progress-fill" style={{ width: '85%' }} />
                </div>
              </div>
              <h3 className="heading-font text-2xl lg:text-3xl mb-3" style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>Sub-Second Sync</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Frame-accurate playback lock. Even viewers on slower connections stay on the exact same frame.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Eyebrow + Heading */}
          <div className="lg:col-span-5">
            <p className="eyebrow">Good to Know</p>
            <h2 className="heading-font text-4xl sm:text-5xl lg:text-6xl mb-6" style={{ color: 'var(--text-primary)', lineHeight: 1.05 }}>
              Frequently<br />Asked Questions
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Got questions about watching together, room limits, or audio sync? Here are the most common answers.
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-trigger"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  aria-expanded={openIdx === i}
                >
                  <span className="text-base sm:text-lg font-medium">{faq.q}</span>
                  <span className={`faq-icon ${openIdx === i ? 'open' : ''}`}>
                    {openIdx === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <div className={`faq-answer ${openIdx === i ? 'open' : ''}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode,   setJoinCode]   = useState('');
  const [isJoining,  setIsJoining]  = useState(false);

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const code = generateRoomCode();
      const { error } = await supabase.from('rooms').insert([{ code }]).select().single();
      if (error) throw error;
      router.push(`/room/${code}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create room');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    router.push(`/room/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ── HERO ───────────────────────────────── */}
      <main className="flex-1">
        <section className="hero-section">
          <div className="page-container hero-grid">
            {/* Left copy */}
            <div className="min-w-0">
              {/* Live badge */}
              <div className="live-badge anim-1 w-fit" style={{ marginBottom: 32 }}>
                <span className="live-dot" />
                LIVE SYNC ROOM · NO SIGN-UP
              </div>

              <h1 className="heading-font anim-2" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.5rem, 4.2vw, 4.5rem)' }}>
                Watch YouTube<br />
                <span style={{ color: 'var(--accent-orange)' }}>In Perfect Sync.</span>
              </h1>

              <p className="anim-3" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 1.3vw, 1.15rem)', lineHeight: 1.75, maxWidth: '480px', marginTop: 28 }}>
                ApexListener keeps every viewer locked to the{' '}
                <strong style={{ color: 'var(--text-primary)' }}>exact same frame</strong>
                {' '}— no account, no downloads, no &quot;wait, pause it.&quot; Create a room, send the link, hit play together.
              </p>

              {/* CTA row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 anim-4" style={{ marginTop: 40 }}>
                <button
                  id="create-room-btn"
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="btn-primary"
                >
                  {isCreating
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Play className="w-4 h-4 fill-white" />
                  }
                  Create Room
                </button>

                <form onSubmit={handleJoinRoom} className="room-input-wrapper" style={{ maxWidth: 220 }}>
                  <input
                    id="join-room-input"
                    type="text"
                    placeholder="ENTER ROOM CODE"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="room-input"
                    maxLength={6}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    disabled={!joinCode.trim() || isJoining}
                    className="room-input-arrow"
                    aria-label="Join Room"
                  >
                    {isJoining
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <ArrowRight className="w-4 h-4" />
                    }
                  </button>
                </form>
              </div>

              {/* Mini trust bar */}
              <div className="flex flex-wrap items-center gap-6 anim-4" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, marginTop: 32 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap style={{ width: 14, height: 14, color: 'var(--accent-teal)', flexShrink: 0 }} />
                  Sub-second sync
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users style={{ width: 14, height: 14, color: 'var(--accent-teal)', flexShrink: 0 }} />
                  Anonymous by default
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ListMusic style={{ width: 14, height: 14, color: 'var(--accent-teal)', flexShrink: 0 }} />
                  Shared queue
                </span>
              </div>
            </div>

            {/* Right — browser mockup */}
            <div className="mockup-col anim-3">
              <BrowserMockup />
            </div>
          </div>
        </section>

        {/* ── SECTIONS ───────────────────────────── */}
        <HowItWorks />
        <Features />
        <FAQ />
      </main>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="py-7 sm:py-8 text-[14px]">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + Tech Stack */}
          <div className="flex items-center gap-3">
            <LogoIcon className="h-7 w-auto" />
            <span className="font-medium tracking-tight text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Built with Next.js • Socket.IO • Supabase
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features"     className="hover:text-white transition-colors">Features</a>
            <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
            <Link href="/blog"     className="hover:text-white transition-colors">Blog</Link>
            <Link href="/contact"  className="hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy"  className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
