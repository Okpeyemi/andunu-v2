'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';

interface Step4MotivationProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step4Motivation({ onNext, onPrev }: Step4MotivationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onNext();
    }, 300);
  };
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-2xl text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
          Vite tu planifies, Vite tu es <span className="text-[var(--primary)]">servis</span>
        </h2>
        
        <div className="space-y-4 text-lg text-gray-600">
          <p>
            Plus besoin d'attendre dans les files d'attente interminables. Planifiez maintenant et recevez vos repas à l'heure exacte
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all"
        >
          Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-2xl text-lg font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-all flex items-center gap-2"
        >
          {isSubmitting && <Spinner size="sm" />}
          Suivant
        </button>
      </div>
    </div>
  );
}
