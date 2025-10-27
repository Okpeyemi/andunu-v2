'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FadeIn, StaggerContainer, StaggerItem, ScaleIn } from './animations';
import WhatsAppModal from './WhatsAppModal';
import PhoneInput from './PhoneInput';

function VideoWithFallback({ 
  videoSrc, 
  imageSrc, 
  alt 
}: { 
  videoSrc: string; 
  imageSrc: string; 
  alt: string;
}) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, []);

  return (
    <>
      {!isVideoReady && (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
        />
      )}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

export default function HeroSection() {
  const [phone, setPhone] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      setIsModalOpen(true);
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="mx-auto container px-4 sm:px-6">
        <div className="flex flex-col items-center text-center max-w-7xl mx-auto">
          {/* Main Heading */}
          <FadeIn delay={0.1} direction="up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
              Planifiez votre repas, recevez-le à l'heure exacte.
            </h1>
          </FadeIn>

          {/* Subheading */}
          <FadeIn delay={0.2} direction="up">
            <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-6 sm:mb-8 max-w-3xl px-4">
              Dites adieu aux files d'attente sous le soleil et aux "désolé, c'est épuisé". 
              Commandez à 8h pour 12h, payez en ligne, et profitez de votre déjeuner livré directement.
            </p>
          </FadeIn>

          {/* Phone Input & CTA Button */}
          <FadeIn delay={0.3} direction="up">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start w-full max-w-xl mb-12 sm:mb-16 px-4">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="Indicatif + numéro (ex: 22997000000)"
                className="flex-1 w-full rounded-2xl border border-gray-300 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button 
                type="submit"
                className="rounded-2xl bg-[var(--primary)] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap text-center self-start"
              >
                Commencer
              </button>
            </form>
          </FadeIn>

          {/* Mockup Images Section */}
          <div className="relative w-full max-w-6xl mx-auto mt-6 sm:mt-8 h-[500px] sm:h-[600px] md:h-[700px] hidden sm:block drop-shadow-lg">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Left Image - People (Behind) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-[380px] sm:h-[450px] md:h-[520px] rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 shadow-xl z-10">
                <VideoWithFallback
                  videoSrc="/attente.mp4"
                  imageSrc="/attente.png"
                  alt="Personne en attente"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
              </div>

              {/* Center Image - Dashboard/Interface (Front) */}
              <div className="relative w-[45%] h-[480px] sm:h-[560px] md:h-[650px] rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 shadow-2xl z-20">
                <Image
                  src="/andunu.png"
                  alt="Interface andunu"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
              </div>

              {/* Right Image - People (Behind) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[30%] h-[380px] sm:h-[450px] md:h-[520px] rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 shadow-xl z-10">
                <VideoWithFallback
                  videoSrc="/termine.mp4"
                  imageSrc="/termine.png"
                  alt="Repas terminée"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <WhatsAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
