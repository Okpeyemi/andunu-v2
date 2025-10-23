'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full border-b border-gray-200 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm' 
          : 'bg-white'
      }`}
    >
      <div className="mx-auto container px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
            andunu
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#fonctionnalites" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link 
              href="#comment-ca-marche" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Comment ça marche
            </Link>
            <Link 
              href="#contact" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <Link 
            href="#commencer"
            className="rounded-2xl bg-[var(--primary)] px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Commencer
          </Link>
        </div>
      </div>
    </header>
  );
}
