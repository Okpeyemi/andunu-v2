export const siteConfig = {
  name: 'Andunu',
  description: 'Planifiez votre repas, recevez-le à l\'heure exacte. Dites adieu aux files d\'attente.',
  url: 'https://andunu.com',
  ogImage: 'https://andunu.com/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/andunu',
    facebook: 'https://facebook.com/andunu',
    instagram: 'https://instagram.com/andunu',
    linkedin: 'https://linkedin.com/company/andunu',
  },
};

export const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Andunu',
  url: 'https://andunu.com',
  description: 'Service de livraison de repas planifiée pour entreprises et particuliers',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://andunu.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Andunu',
  url: 'https://andunu.com',
  logo: 'https://andunu.com/logo.png',
  description: 'Service de livraison de repas planifiée',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Service Client',
    email: 'contact@andunu.com',
  },
  sameAs: [
    'https://twitter.com/andunu',
    'https://facebook.com/andunu',
    'https://instagram.com/andunu',
    'https://linkedin.com/company/andunu',
  ],
};

export const jsonLdService = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Livraison de repas',
  provider: {
    '@type': 'Organization',
    name: 'Andunu',
    url: 'https://andunu.com',
  },
  areaServed: {
    '@type': 'Country',
    name: 'France',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services de livraison de repas',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Commande anticipée',
          description: 'Commandez à 8h pour 12h',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Livraison à l\'heure',
          description: 'Livraison garantie à l\'heure exacte',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Abonnement flexible',
          description: 'Planifiez pour la semaine et économisez',
        },
      },
    ],
  },
};
