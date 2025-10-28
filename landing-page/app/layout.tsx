import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import NavigationLoader from "@/components/NavigationLoader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Andunu - Planifiez votre repas, recevez-le à l'heure exacte",
    template: "%s | Andunu"
  },
  description: "Dites adieu aux files d'attente. Commandez à 8h pour 12h, payez en ligne, et profitez de votre déjeuner livré directement. Simple, fiable et rapide.",
  keywords: [
    "livraison repas",
    "commande repas en ligne",
    "déjeuner entreprise",
    "planification repas",
    "livraison à l'heure",
    "repas bureau",
    "andunu",
    "commande anticipée",
    "paiement en ligne",
    "abonnement repas"
  ],
  authors: [{ name: "Andunu" }],
  creator: "Andunu",
  publisher: "Andunu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://andunu.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://andunu.com',
    title: 'Andunu - Planifiez votre repas, recevez-le à l\'heure exacte',
    description: 'Dites adieu aux files d\'attente. Commandez à 8h pour 12h, payez en ligne, et profitez de votre déjeuner livré directement.',
    siteName: 'Andunu',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Andunu - Livraison de repas à l\'heure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Andunu - Planifiez votre repas, recevez-le à l\'heure exacte',
    description: 'Dites adieu aux files d\'attente. Commandez à 8h pour 12h, payez en ligne, et profitez de votre déjeuner livré directement.',
    images: ['/twitter-image.jpg'],
    creator: '@andunu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification=4SB5m7uqMbidgnActrOcmvZibrLMlyyDND6XqbrBFSc',
    // yandex: 'votre-code-yandex',
    // bing: 'votre-code-bing',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${poppins.variable} ${dmSans.variable} antialiased`}
      >
        <NavigationLoader />
        {children}
      </body>
    </html>
  );
}
