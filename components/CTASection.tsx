import Image from 'next/image';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="w-full bg-[var(--primary)] py-20 md:py-32">
      <div className="mx-auto container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mx-auto">
          {/* Left Content */}
          <div className="flex flex-col">
            {/* Subhead */}
            <p className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              TA BOUFFE À TA PORTÉE
            </p>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Prêt à gagner du temps ?
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Inscrivez-vous gratuitement et planifiez votre premier repas.
            </p>

            {/* Email Input & CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start w-full max-w-xl">
              <input 
                type="email"
                placeholder="Votre adresse e-mail"
                className="flex-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 px-6 py-4 text-base text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <Link 
                href="#commencer"
                className="rounded-2xl bg-white px-8 py-4 text-base font-medium text-primary hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Commencer
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden bg-white/10">
            <Image
              src="/cta-image.jpg"
              alt="Prêt à gagner du temps"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
