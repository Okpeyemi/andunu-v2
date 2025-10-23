import Image from 'next/image';

export default function UniqueSection() {
  const features = [
    {
      icon: '/icon-planning.png',
      title: 'Planification facile',
      description: 'Choisissez votre repas et l\'heure de livraison dès le matin.',
    },
    {
      icon: '/icon-payment.png',
      title: 'Paiement sécurisé',
      description: 'Payez en ligne et oubliez les files d\'attente.',
    },
    {
      icon: '/icon-delivery.png',
      title: 'Livraison à l\'heure',
      description: 'Votre repas arrive pile poil, frais et chaud.',
    },
    {
      icon: '/icon-subscription.png',
      title: 'Abonnements flexibles',
      description: 'Planifiez pour la semaine et économisez en temps et argent.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Choisissez et planifiez',
      description: 'À 8h, sélectionnez votre repas pour 12h via notre app ou site.',
    },
    {
      number: '2',
      title: 'Payez en sécurité',
      description: 'Confirmez avec votre carte ou wallet, sans frais cachés.',
    },
    {
      number: '3',
      title: 'Recevez et savourez',
      description: 'À 12h pile, votre livraison arrive – frais et prêt à déguster.',
    },
  ];

  return (
    <section className="w-full bg-white py-20 md:py-32">
      <div className="mx-auto container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mx-auto">
          {/* Left Content */}
          <div className="flex flex-col max-w-xl">
            {/* Subhead */}
            <p className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              ANDUNU
            </p>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Ce qui nous rend unique
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              Nous combinons simplicité, fiabilité et gain de temps pour vous offrir une expérience de repas sans frictions.
            </p>
          </div>

          {/* Right Features List */}
          <div className="flex flex-col gap-10">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 items-center">
                {/* Icon */}
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-foreground flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-base md:text-lg text-foreground/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Steps Section */}
        <div className="mt-32 container mx-auto border-t pt-20 border-[var(--primary)]/10">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--primary)] mb-4">
              En 3 étapes simples
            </h2>
            <p className="text-lg md:text-xl text-foreground/80">
              Planifiez, payez en toute sécurité, et recevez à l'heure exacte — c'est tout.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex p-8 border-2 border-[var(--primary)]/10 rounded-2xl hover:border-primary transition-colors gap-6 items-center"
              >
                {/* Number Badge */}
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xl font-bold mb-6">
                  {step.number}
                </div>

                <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base md:text-lg text-foreground/70">
                    {step.description}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
