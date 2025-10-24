'use client';

import Image from 'next/image';
import { FadeIn } from './animations';

export default function WhySection() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="mx-auto container px-4 sm:px-6">
        <div className="flex flex-col gap-16 sm:gap-20 md:gap-24 max-w-7xl mx-auto">
          {/* First Row - Image Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Image */}
            <FadeIn direction="left" delay={0.1}>
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                <Image
                  src="/file-attente.png"
                  alt="File d'attente"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
              </div>
            </FadeIn>

            {/* Right Content */}
            <FadeIn direction="right" delay={0.2}>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Faut-il encore attendre en file sous un soleil brûlant ?
                </h2>
              </div>
            </FadeIn>
          </div>

          {/* Second Row - Text Left, Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Content */}
            <FadeIn direction="left" delay={0.1} className="order-2 lg:order-1">
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Vaut-il le coup d'entendre "C'est terminé" après avoir patientié ?
                </h2>
              </div>
            </FadeIn>

            {/* Right Image */}
            <FadeIn direction="right" delay={0.2} className="order-1 lg:order-2">
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                <Image
                  src="/termine.png"
                  alt="Repas terminé"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
              </div>
            </FadeIn>
          </div>

          {/* Third Row - Image Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Image */}
            <FadeIn direction="left" delay={0.1}>
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                <Image
                  src="/perte-de-temps.png"
                  alt="Perte de temps"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
              </div>
            </FadeIn>

            {/* Right Content */}
            <FadeIn direction="right" delay={0.2}>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Doit-on encore perdre des heures précieuses chaque semaine ?
                </h2>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
