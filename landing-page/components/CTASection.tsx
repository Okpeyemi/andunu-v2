'use client';

import Image from 'next/image';
import { FadeIn, ScaleIn } from './animations';

export default function CTASection() {
  return (
    <section id="cta" className="w-full bg-[var(--primary)] py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="mx-auto container px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center mx-auto">
          {/* Left Content */}
          <FadeIn direction="left" delay={0.1}>
            <div className="flex flex-col max-w-xl">
              {/* Subhead */}
              <p className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
                TA BOUFFE À TA PORTÉE
              </p>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold !text-white leading-tight mb-4 sm:mb-6">
                Prêt à gagner du temps ?
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
                Inscrivez-vous gratuitement et planifiez votre premier repas.
              </p>

              {/* CTA Button */}
              <div className="flex w-full">
                <a 
                  href="/planifier"
                  className="rounded-2xl bg-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary hover:opacity-90 transition-opacity whitespace-nowrap text-center"
                >
                  Commencer
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Right Image */}
          <ScaleIn delay={0.3}>
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden bg-white/10 shadow-lg">
              <Image
                src="/gagner-du-temps.png"
                alt="Prêt à gagner du temps"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
            </div>
          </ScaleIn>
        </div>
      </div>
    </section>
  );
}
