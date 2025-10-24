'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from './animations';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    message: '',
    pays: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire à implémenter
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="w-full bg-white pt-20">
      {/* Hero Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="mx-auto container px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Form */}
          <div>
            <FadeIn direction="up" delay={0.1}>
              <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
                CONTACTEZ-NOUS
              </p>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8 sm:mb-12">
                Contactez l'équipe<br />commerciale
              </h1>
            </FadeIn>
            <FadeIn direction="up" delay={0.3}>
              <p className="text-base sm:text-lg text-foreground/80 max-w-2xl mb-12 sm:mb-16">
                Nous vous aiderons à trouver les solutions et la formule idéales pour votre entreprise. 
                Remplissez le formulaire ci-dessous : notre équipe vous répondra dans les plus brefs délais.
              </p>
            </FadeIn>

            <StaggerContainer staggerDelay={0.1}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Prénom et Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-foreground mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* E-mail professionnel */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    E-mail professionnel
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* Pays */}
                <div>
                  <label htmlFor="pays" className="block text-sm font-medium text-foreground mb-2">
                    Pays
                  </label>
                  <select
                    id="pays"
                    name="pays"
                    value={formData.pays}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5rem'
                    }}
                  >
                    <option value="">Sélectionnez un pays</option>
                    <option value="benin">Bénin</option>
                    <option value="togo">Togo</option>
                    <option value="nigeria">Nigeria</option>
                    <option value="ghana">Ghana</option>
                    <option value="cote-ivoire">Côte d'Ivoire</option>
                    <option value="senegal">Sénégal</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Termes et conditions */}
                <div className="text-sm text-foreground/70">
                  En envoyant mes informations personnelles, j'accepte que Andunu puisse collecter, 
                  traiter et conserver mes données conformément à la{' '}
                  <Link href="#" className="text-foreground underline hover:text-primary">
                    Politique de confidentialité
                  </Link>
                  .
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[var(--primary)] hover:opacity-90 px-6 py-4 text-base !text-white font-semibold transition-colors"
                >
                  Envoyer
                </button>
              </form>
            </StaggerContainer>
          </div>

          {/* Right Column - Help Sections */}
          <FadeIn direction="right" delay={0.2}>
            <div className="flex flex-col gap-8">
            {/* Assistance produit */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Assistance produit et aide concernant votre compte
              </h2>
              <p className="text-base text-foreground/80 mb-4">
                Toujours à votre service. Consultez notre base de connaissances pour trouver 
                toutes les réponses aux questions fréquentes.
              </p>
              <Link 
                href="#"
                className="inline-flex items-center text-foreground font-medium hover:text-primary transition-colors group"
              >
                Consultez le Centre d'aide
                <svg 
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Nous appeler */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Nous appeler
              </h2>
              <p className="text-base text-foreground/80 mb-2">
                Appelez-nous au{' '}
                <a 
                  href="tel:+22997000000" 
                  className="text-foreground font-semibold underline hover:text-primary"
                >
                  +229 97 00 00 00
                </a>
              </p>
              <p className="text-sm text-foreground/70">
                Du lundi au vendredi, de 8 h à 18 h
              </p>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
