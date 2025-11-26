import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Paramètres",
    description: "Configurez les paramètres de votre compte et de l'application.",
    openGraph: {
        title: "Paramètres | Andunu",
        description: "Configurez les paramètres de votre compte et de l'application.",
    },
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
