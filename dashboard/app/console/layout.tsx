import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Console d'Administration",
    description: "Console d'administration pour la gestion avancée de la plateforme.",
    openGraph: {
        title: "Console d'Administration | Andunu",
        description: "Console d'administration pour la gestion avancée de la plateforme.",
    },
};

export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
