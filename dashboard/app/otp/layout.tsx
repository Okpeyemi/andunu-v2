import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Vérification OTP",
    description: "Vérifiez votre code de sécurité à usage unique.",
    openGraph: {
        title: "Vérification OTP | Andunu",
        description: "Vérifiez votre code de sécurité à usage unique.",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function OTPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
