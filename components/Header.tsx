'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PhoneModal from './PhoneModal';
import WhatsAppModal from './WhatsAppModal';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const pathname = usePathname();

  const handlePhoneSubmit = (phone: string) => {
    setIsWhatsAppModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-primary underline underline-offset-4 underline-2' : 'text-foreground hover:text-primary hover:underline hover:underline-offset-4 hover:underline-2'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/contact' ? 'text-primary underline underline-offset-4 underline-2' : 'text-foreground hover:text-primary hover:underline hover:underline-offset-4 hover:underline-2'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* CTA Button - Desktop */}
          <Link 
            href="/planifier"
            className="hidden md:block rounded-2xl bg-[var(--primary)] px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Commencer
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-4">
            <Link 
              href="/" 
              className={`text-base font-medium transition-colors ${
                pathname === '/' ? 'text-primary underline underline-offset-4 underline-2' : 'text-foreground hover:text-primary hover:underline hover:underline-offset-4 hover:underline-2'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href="/contact" 
              className={`text-base font-medium transition-colors ${
                pathname === '/contact' ? 'text-primary underline underline-offset-4 underline-2' : 'text-foreground hover:text-primary hover:underline hover:underline-offset-4 hover:underline-2'
              }`}
            >
              Contact
            </Link>
            <Link 
              href="/planifier"
              className="rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity text-center mt-2 w-full block"
            >
              Commencer
            </Link>
          </nav>
        )}
      </div>
      <PhoneModal 
        isOpen={isPhoneModalOpen} 
        onClose={() => setIsPhoneModalOpen(false)}
        onSubmit={handlePhoneSubmit}
      />
      <WhatsAppModal 
        isOpen={isWhatsAppModalOpen} 
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </header>
  );
}
