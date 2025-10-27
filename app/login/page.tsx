'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/PhoneInput';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation du numéro
    if (!phone || phone.length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Appeler l'API pour envoyer l'OTP
      // Pour l'instant, on simule l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sauvegarder le numéro dans sessionStorage
      sessionStorage.setItem('phoneNumber', phone);

      // Rediriger vers la page OTP
      router.push('/otp');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[var(--primary)] mb-4">
            andunu
          </h1>
          <p className="text-gray-600 text-lg">
            Connectez-vous pour continuer
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="Indicatif + numéro (ex: 22997000000)"
              className="w-full rounded-2xl border border-gray-300 px-6 py-4 text-base text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isSubmitting || !phone}
            className="w-full rounded-2xl bg-[var(--primary)] px-6 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              'Recevoir le code'
            )}
          </button>
        </form>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Un code de vérification sera envoyé à votre numéro
          </p>
        </div>

        {/* Lien retour */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
