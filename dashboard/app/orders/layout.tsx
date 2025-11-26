import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gestion des Commandes",
    description: "Consultez et gérez toutes vos commandes. Suivez les statuts et les livraisons en temps réel.",
    openGraph: {
        title: "Gestion des Commandes | Andunu",
        description: "Consultez et gérez toutes vos commandes. Suivez les statuts et les livraisons en temps réel.",
    },
};

export default function OrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
