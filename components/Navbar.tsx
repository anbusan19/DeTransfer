'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent, href: string, hash?: string) => {
    e.preventDefault();
    if (hash) {
      router.push(href + hash);
      // Small timeout to allow view to render before scrolling
      setTimeout(() => {
        const element = document.querySelector(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      router.push(href);
      if (href === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-start px-6 py-6 md:px-12 md:py-8 pointer-events-none">
      {/* Empty div for spacing balance */}
      <div className="hidden md:block w-32"></div>

      {/* Centered Pill Nav */}
      <nav className="pointer-events-auto bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-1 py-1 flex items-center gap-1 shadow-2xl">
        <Link 
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className={`px-5 py-2 rounded-full font-sans font-medium text-sm flex items-center gap-2 transition-all ${
            isActive('/')
              ? 'bg-white text-black scale-105 shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Home
        </Link>
        <Link 
          href="/receive"
          onClick={(e) => handleNavClick(e, '/receive')}
          className={`px-5 py-2 rounded-full font-sans font-medium text-sm flex items-center gap-2 transition-all ${
            isActive('/receive')
              ? 'bg-white text-black scale-105 shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          Receive
        </Link>
        <Link 
          href="/#docs" 
          onClick={(e) => handleNavClick(e, '/', '#docs')}
          className="px-5 py-2 text-gray-300 hover:text-white font-sans text-sm font-medium transition-colors hover:bg-white/5 rounded-full"
        >
          Docs
        </Link>
        <Link 
          href="/#news" 
          onClick={(e) => handleNavClick(e, '/', '#news')}
          className="px-5 py-2 text-gray-300 hover:text-white font-sans text-sm font-medium transition-colors hover:bg-white/5 rounded-full"
        >
          News
        </Link>
      </nav>

      {/* Right CTA */}
      <div className="pointer-events-auto">
        <Link 
          href="/bridge"
          className={`group px-5 py-2.5 rounded-full font-sans font-medium text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
            isActive('/bridge') || isActive('/upload')
              ? 'bg-eco-accent text-white ring-2 ring-white/20'
              : 'bg-white text-black hover:bg-gray-200 active:scale-95'
          }`}
        >
          Bridge with Portal
          <div className={`rounded-full p-1 transition-transform group-hover:translate-x-1 ${
             isActive('/bridge') || isActive('/upload') ? 'bg-white/20 text-white' : 'bg-black text-white'
          }`}>
            <ArrowRight size={12} />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
