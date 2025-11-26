import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";

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
    default: "Andunu - Gestion de Livraison de Repas",
    template: "%s | Andunu"
  },
  description: "Plateforme de gestion de livraison de repas. Gérez vos commandes, repas, clients et livraisons en toute simplicité.",
  keywords: ["livraison", "repas", "gestion", "commandes", "restaurant", "food delivery"],
  authors: [{ name: "Andunu" }],
  creator: "Andunu",
  publisher: "Andunu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Andunu",
    title: "Andunu - Gestion de Livraison de Repas",
    description: "Plateforme de gestion de livraison de repas. Gérez vos commandes, repas, clients et livraisons en toute simplicité.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Andunu - Gestion de Livraison de Repas",
    description: "Plateforme de gestion de livraison de repas",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
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
        {children}
      </body>
    </html>
  );
}
