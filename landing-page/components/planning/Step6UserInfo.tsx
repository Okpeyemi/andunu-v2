'use client';

import { useState } from 'react';
import PhoneInput from '@/components/PhoneInput';
import Spinner from '@/components/Spinner';
import { supabase } from '@/lib/supabase';

interface Step5UserInfoProps {
  onSubmit: (info: { fullName: string; phone: string; userId: string }) => void;
  onPrev: () => void;
}

export default function Step5UserInfo({ onSubmit, onPrev }: Step5UserInfoProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Le nom complet est requis');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setError('Numéro de téléphone invalide');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Créer le compte utilisateur avec Supabase (OTP par SMS)
      const { data, error: signUpError } = await supabase.auth.signUp({
        phone: formattedPhone,
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: formattedPhone,
            role: 'client'
          },
          channel: 'sms' // OTP par SMS
        }
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // Passer au step suivant avec les infos
      onSubmit({ 
        fullName: fullName.trim(), 
        phone: formattedPhone,
        userId: data.user.id
      });
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
      setIsSubmitting(false);
    }
  };

  const isValid = 
    fullName.trim() && 
    phone.trim() && 
    phone.length >= 10 &&
    password.length >= 8 &&
    password === confirmPassword;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-8">
        Remplis tes informations
      </h2>

      <div className="w-full max-w-md space-y-6 mb-6">
        {/* Nom complet */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Entrez votre nom complet"
            disabled={isSubmitting}
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone *
          </label>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            placeholder="Indicatif + numéro (ex: 22997000000)"
            disabled={isSubmitting}
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              disabled={isSubmitting}
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
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
          <p className="text-xs text-gray-500 mt-1">
            Au moins 8 caractères
          </p>
        </div>

        {/* Confirmer mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              disabled={isSubmitting}
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {showConfirmPassword ? (
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
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="w-full max-w-md mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
            isValid && !isSubmitting
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting && <Spinner size="sm" />}
          {isSubmitting ? 'Création du compte...' : 'S\'inscrire'}
        </button>
      </div>
    </div>
  );
}
