import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Mot de passe oublié",
    description: "Réinitialisez votre mot de passe en toute sécurité.",
    openGraph: {
        title: "Mot de passe oublié | Andunu",
        description: "Réinitialisez votre mot de passe en toute sécurité.",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
