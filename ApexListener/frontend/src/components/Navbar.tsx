'use client';

import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { LogoIcon } from '@/components/LogoIcon';

export function Navbar() {
  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="page-container h-[72px] flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <LogoIcon className="h-8 w-auto transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg sm:text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            ApexListener
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="/#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-emerald-400">
            Blog
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
        </div>

        {/* Support button */}
        <div className="flex items-center gap-3">
          <a
            href="https://ko-fi.com/aditya69939"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-support"
          >
            <Coffee className="w-3.5 h-3.5" />
            Support me
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
