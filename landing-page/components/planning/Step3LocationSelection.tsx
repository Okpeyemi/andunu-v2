'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';
import CustomSelect from '@/components/ui/CustomSelect';

interface Step3LocationSelectionProps {
  onSubmit: (location: string) => void;
  onPrev: () => void;
}

// Liste des lieux disponibles
const LOCATIONS = ['Epitech'];

export default function Step3LocationSelection({
  onSubmit,
  onPrev,
}: Step3LocationSelectionProps) {
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (location.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit(location);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-8">
        Où voudrais-tu être livré ?
      </h2>

      <div className="w-full max-w-md mb-8">
        <CustomSelect
          options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
          value={location}
          onChange={setLocation}
          placeholder="Sélectionne ton lieu de livraison"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all"
        >
          Précédent
        </button>
        <button
          onClick={handleSubmit}
          disabled={!location.trim() || isSubmitting}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
            location.trim() && !isSubmitting
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
