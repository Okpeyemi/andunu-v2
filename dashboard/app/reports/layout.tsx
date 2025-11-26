import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Rapports et Statistiques",
    description: "Consultez les rapports détaillés et les statistiques de votre activité.",
    openGraph: {
        title: "Rapports et Statistiques | Andunu",
        description: "Consultez les rapports détaillés et les statistiques de votre activité.",
    },
};

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
