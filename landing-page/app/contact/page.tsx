import ContactForm from '../../components/ContactForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - Contactez l\'équipe commerciale',
  description: 'Contactez l\'équipe commerciale Andunu. Nous vous aiderons à trouver les solutions et la formule idéales pour votre entreprise. Réponse rapide garantie.',
  keywords: [
    'contact andunu',
    'équipe commerciale',
    'support client',
    'assistance andunu',
    'formulaire contact',
    'aide entreprise',
    'service client',
    'contacter andunu'
  ],
  openGraph: {
    title: 'Contact - Contactez l\'équipe commerciale Andunu',
    description: 'Nous vous aiderons à trouver les solutions et la formule idéales pour votre entreprise. Remplissez le formulaire : notre équipe vous répondra dans les plus brefs délais.',
    url: 'https://andunu.com/contact',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contactez Andunu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact - Contactez l\'équipe commerciale Andunu',
    description: 'Nous vous aiderons à trouver les solutions et la formule idéales pour votre entreprise.',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <ContactForm />
      <Footer />
    </>
  );
}
