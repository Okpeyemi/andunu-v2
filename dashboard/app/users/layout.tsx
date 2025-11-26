import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gestion des Utilisateurs",
    description: "Gérez les comptes utilisateurs, les rôles et les permissions de votre plateforme.",
    openGraph: {
        title: "Gestion des Utilisateurs | Andunu",
        description: "Gérez les comptes utilisateurs, les rôles et les permissions de votre plateforme.",
    },
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
