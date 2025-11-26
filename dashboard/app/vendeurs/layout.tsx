import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gestion des Vendeurs",
    description: "Gérez les vendeurs partenaires et leurs informations.",
    openGraph: {
        title: "Gestion des Vendeurs | Andunu",
        description: "Gérez les vendeurs partenaires et leurs informations.",
    },
};

export default function VendeursLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
