'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/PhoneInput';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!phone || phone.length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Appeler l'API pour vérifier les credentials
      // Pour l'instant, on simule la vérification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simuler une vérification (accepter 22997000000 / user123 pour les tests)
      if (phone === '22997000000' && password === 'user123') {
        // Sauvegarder l'authentification
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userPhone', phone);
        
        // Rediriger vers le dashboard
        router.push('/');
      } else {
        setError('Numéro de téléphone ou mot de passe incorrect');
        setIsSubmitting(false);
      }
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

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-300 px-6 py-4 pr-12 text-base text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
            disabled={isSubmitting || !phone || !password}
            className="w-full rounded-2xl bg-[var(--primary)] px-6 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span>Connexion...</span>
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Informations de test */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-600 font-mono mb-2">🔧 Mode développement</p>
            <p className="text-xs text-gray-600">Téléphone: 22997000000</p>
            <p className="text-xs text-gray-600">Mot de passe: user123</p>
          </div>
        )}

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
