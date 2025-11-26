import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Mise à jour du mot de passe",
    description: "Créez un nouveau mot de passe sécurisé pour votre compte.",
    openGraph: {
        title: "Mise à jour du mot de passe | Andunu",
        description: "Créez un nouveau mot de passe sécurisé pour votre compte.",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function UpdatePasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
