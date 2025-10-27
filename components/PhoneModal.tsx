'use client';

import { useEffect, useState } from 'react';
import { FadeIn } from './animations';
import PhoneInput from './PhoneInput';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
}

export default function PhoneModal({ isOpen, onClose, onSubmit }: PhoneModalProps) {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setPhone(''); // Reset phone when modal closes
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      onSubmit(phone);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <FadeIn>
        <div 
          className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Commencer
              </h3>
              <p className="text-sm sm:text-base text-foreground/70">
                Entrez votre numéro pour planifier votre repas
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-foreground/50 hover:text-foreground transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="Indicatif + numéro (ex: 22997000000)"
              className="w-full rounded-2xl border border-gray-300 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!phone.trim()}
              className="w-full rounded-2xl bg-[var(--primary)] px-6 py-4 text-base font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
