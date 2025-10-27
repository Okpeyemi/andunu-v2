'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Récupérer le numéro de téléphone
    const phone = sessionStorage.getItem('phoneNumber');
    if (!phone) {
      router.push('/login');
      return;
    }
    setPhoneNumber(phone);

    // Focus sur le premier input
    inputRefs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    // Compte à rebours pour le renvoi du code
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Accepter seulement les chiffres
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Passer au champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Soumettre automatiquement si tous les champs sont remplis
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Retour arrière
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    // Focus sur le dernier champ rempli
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    // Soumettre si 6 chiffres
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Veuillez entrer le code à 6 chiffres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Appeler l'API pour vérifier l'OTP
      // Pour l'instant, on simule la vérification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simuler une vérification (accepter 123456 pour les tests)
      if (otpCode === '123456') {
        // Sauvegarder l'authentification
        sessionStorage.setItem('isAuthenticated', 'true');
        
        // Rediriger vers le dashboard ou la page précédente
        router.push('/planifier');
      } else {
        setError('Code incorrect. Veuillez réessayer.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);
    setError('');

    try {
      // TODO: Appeler l'API pour renvoyer l'OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Message de succès (optionnel)
      alert('Un nouveau code a été envoyé');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de renvoyer le code. Veuillez réessayer.');
      setCanResend(true);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length < 4) return phone;
    return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[var(--primary)] mb-4">
            andunu
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Vérification du code
          </p>
          <p className="text-sm text-gray-500">
            Code envoyé au {maskPhoneNumber(phoneNumber)}
          </p>
        </div>

        {/* Formulaire OTP */}
        <div className="space-y-6">
          {/* Inputs OTP */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isSubmitting}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            ))}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting || otp.some(digit => digit === '')}
            className="w-full rounded-2xl bg-[var(--primary)] px-6 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span>Vérification...</span>
              </>
            ) : (
              'Vérifier le code'
            )}
          </button>

          {/* Renvoyer le code */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-[var(--primary)] hover:underline font-medium"
              >
                Renvoyer le code
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Renvoyer le code dans <span className="font-semibold text-[var(--primary)]">{countdown}s</span>
              </p>
            )}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Vous n'avez pas reçu le code ? Vérifiez vos SMS
          </p>
        </div>

        {/* Lien retour */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            ← Changer de numéro
          </button>
        </div>
      </div>
    </div>
  );
}
