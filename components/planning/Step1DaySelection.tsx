'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';

interface Step1DaySelectionProps {
  onSubmit: (days: string[]) => void;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function Step1DaySelection({ onSubmit }: Step1DaySelectionProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (selectedDays.length > 0) {
      setIsSubmitting(true);
      // Petit délai pour montrer le spinner
      setTimeout(() => {
        onSubmit(selectedDays);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="max-w-2xl text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-8">
        Quelles sont les jours que tu voudrais planifier ?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
              selectedDays.includes(day)
                ? 'bg-[var(--primary)] text-white shadow-lg scale-105'
                : 'bg-gray-100 text-foreground hover:bg-gray-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedDays.length === 0 || isSubmitting}
        className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
          selectedDays.length > 0 && !isSubmitting
            ? 'bg-[var(--primary)] text-white hover:opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting && <Spinner size="sm" />}
        Suivant
      </button>

      {selectedDays.length > 0 && (
        <p className="mt-4 text-sm text-gray-600">
          {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''} sélectionné{selectedDays.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
