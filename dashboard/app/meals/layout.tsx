import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gestion des Repas",
    description: "Gérez vos repas et accompagnements. Ajoutez, modifiez et organisez votre menu.",
    openGraph: {
        title: "Gestion des Repas | Andunu",
        description: "Gérez vos repas et accompagnements. Ajoutez, modifiez et organisez votre menu.",
    },
};

export default function MealsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
