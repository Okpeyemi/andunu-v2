'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';

interface Step4DeliveryTimeProps {
  onSubmit: (time: string) => void;
  onPrev: () => void;
}

// Créneaux horaires disponibles
const TIME_SLOTS = [
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
];

export default function Step4DeliveryTime({ onSubmit, onPrev }: Step4DeliveryTimeProps) {
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (selectedTime) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit(selectedTime);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        À quelle heure voudrais-tu être livré ?
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Choisis ton créneau horaire préféré
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-8">
        {TIME_SLOTS.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`px-4 py-3 rounded-2xl text-base font-medium transition-all ${
              selectedTime === time
                ? 'bg-[var(--primary)] text-white shadow-lg scale-105'
                : 'bg-gray-100 text-foreground hover:bg-gray-200'
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Précédent
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedTime || isSubmitting}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
            selectedTime && !isSubmitting
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting && <Spinner size="sm" />}
          Suivant
        </button>
      </div>
    </div>
  );
}
