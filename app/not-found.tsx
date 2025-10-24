'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FadeIn, ScaleIn } from '@/components/animations';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="w-full bg-white pt-20">
        <section className="w-full py-20 sm:py-24 md:py-32 lg:py-40">
          <div className="mx-auto container px-4 sm:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* 404 Number */}
              <ScaleIn delay={0.1}>
                <div className="mb-8">
                  <h1 className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[280px] font-bold text-[var(--primary)] leading-none">
                    404
                  </h1>
                </div>
              </ScaleIn>

              {/* Title */}
              <FadeIn direction="up" delay={0.3}>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  Page introuvable
                </h2>
              </FadeIn>

              {/* Description */}
              <FadeIn direction="up" delay={0.4}>
                <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-8 sm:mb-10 max-w-2xl">
                  Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
                  Retournez à l'accueil pour continuer votre navigation.
                </p>
              </FadeIn>

              {/* CTA Buttons */}
              <FadeIn direction="up" delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
                  <Link 
                    href="/"
                    className="rounded-2xl bg-[var(--primary)] px-8 py-4 text-base font-medium text-white hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
                  >
                    Retour à l'accueil
                  </Link>
                  <Link 
                    href="/contact"
                    className="rounded-2xl border-2 border-[var(--primary)] px-8 py-4 text-base font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors w-full sm:w-auto text-center"
                  >
                    Contactez-nous
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
