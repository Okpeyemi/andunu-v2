import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="w-full bg-white py-20 md:py-32">
      <div className="mx-auto container px-6">
        <div className="flex flex-col items-center text-center max-w-7xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Planifiez votre repas, recevez-le à l'heure exacte.
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-3xl">
            Dites adieu aux files d'attente sous le soleil et aux "désolé, c'est épuisé". 
            Commandez à 8h pour 12h, payez en ligne, et profitez de votre déjeuner livré directement.
          </p>

          {/* Email Input & CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-xl mb-16">
            <input 
              type="email"
              placeholder="Saisissez votre adresse e-mail professionnelle"
              className="flex-1 w-full rounded-2xl border border-gray-300 px-6 py-4 text-base text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Link 
              href="#commencer"
              className="rounded-2xl bg-[var(--primary)] px-8 py-4 text-base font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Commencer
            </Link>
          </div>

          {/* Mockup Images Section */}
          <div className="relative w-full max-w-6xl mx-auto mt-8 h-[500px]">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Left Image - People (Behind) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-[350px] rounded-2xl overflow-hidden bg-gray-100 shadow-lg z-10">
                <Image
                  src="/hero-left.jpg"
                  alt="Équipe utilisant andunu"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Center Image - Dashboard/Interface (Front) */}
              <div className="relative w-[45%] h-[450px] rounded-2xl overflow-hidden bg-gray-100 shadow-2xl z-20">
                <Image
                  src="/hero-center.jpg"
                  alt="Interface andunu"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Right Image - People (Behind) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[30%] h-[350px] rounded-2xl overflow-hidden bg-gray-100 shadow-lg z-10">
                <Image
                  src="/hero-right.jpg"
                  alt="Clients satisfaits"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
