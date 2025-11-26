import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Journal d'Activités",
    description: "Consultez l'historique complet des actions effectuées sur la plateforme.",
    openGraph: {
        title: "Journal d'Activités | Andunu",
        description: "Consultez l'historique complet des actions effectuées sur la plateforme.",
    },
};

export default function LogsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
