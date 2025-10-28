'use client';

import { useState, useEffect, useRef } from 'react';
import Spinner from '@/components/Spinner';
import { supabase } from '@/lib/supabase';

interface Step7OTPProps {
  phoneNumber: string;
  userId: string;
  onSubmit: () => void;
  onPrev: () => void;
}

export default function Step7OTP({ phoneNumber, userId, onSubmit, onPrev }: Step7OTPProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Focus sur le premier input
    inputRefs.current[0]?.focus();
  }, []);

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
      // Vérifier l'OTP avec Supabase (SMS)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms'
      });

      if (verifyError) {
        throw verifyError;
      }

      if (!data.user) {
        throw new Error('Erreur lors de la vérification du code');
      }

      // OTP vérifié avec succès
      onSubmit();
    } catch (err: any) {
      console.error('Erreur vérification OTP:', err);
      
      if (err.message?.includes('expired')) {
        setError('Le code a expiré. Demandez un nouveau code.');
      } else if (err.message?.includes('invalid')) {
        setError('Code incorrect. Veuillez réessayer.');
      } else {
        setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);
    setError('');

    try {
      // Renvoyer l'OTP via Supabase (SMS)
      const { error: resendError } = await supabase.auth.resend({
        type: 'sms',
        phone: phoneNumber
      });

      if (resendError) {
        throw resendError;
      }
      
      // Message de succès
      setError('');
      // On pourrait ajouter un message de succès ici
    } catch (err: any) {
      console.error('Erreur renvoi OTP:', err);
      setError(err.message || 'Impossible de renvoyer le code. Veuillez réessayer.');
      setCanResend(true);
      setCountdown(0);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length < 4) return phone;
    return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        Vérification du code
      </h2>
      <p className="text-sm text-gray-500 mb-8 text-center">
        Code envoyé au {maskPhoneNumber(phoneNumber)}
      </p>

      {/* Inputs OTP */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isSubmitting}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center mb-6 w-full max-w-md">
          {error}
        </div>
      )}

      {/* Renvoyer le code */}
      <div className="text-center mb-8">
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

      {/* Informations supplémentaires */}
      <p className="text-sm text-gray-500 mb-8 text-center">
        Vous n'avez pas reçu le code ? Vérifiez vos SMS
      </p>

      {/* Boutons */}
      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          onClick={() => handleSubmit()}
          disabled={isSubmitting || otp.some(digit => digit === '')}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
            !isSubmitting && otp.every(digit => digit !== '')
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting && <Spinner size="sm" />}
          Vérifier
        </button>
      </div>
    </div>
  );
}
