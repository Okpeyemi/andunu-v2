'use client';

import { useState, useEffect } from 'react';

interface Step2MealSelectionProps {
  selectedDays: string[];
  onSubmit: (meals: Record<string, string>) => void;
  onPrev: () => void;
}

// Liste de plats exemple - vous pouvez la personnaliser
const MEALS = [
  'Riz sauce',
  'Attiéké poisson',
  'Alloco',
  'Poulet braisé',
  'Poisson braisé',
  'Foutou',
  'Placali',
  'Kedjenou',
];

export default function Step2MealSelection({
  selectedDays,
  onSubmit,
  onPrev,
}: Step2MealSelectionProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [meals, setMeals] = useState<Record<string, string>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentDay = selectedDays[currentDayIndex];

  // Animation de transition entre les jours
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleMealSelect = (meal: string) => {
    const updatedMeals = { ...meals, [currentDay]: meal };
    setMeals(updatedMeals);

    // Afficher une confirmation visuelle
    setShowConfirmation(true);

    // Attendre avant de passer au jour suivant
    setTimeout(() => {
      setShowConfirmation(false);
      
      if (currentDayIndex < selectedDays.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentDayIndex(currentDayIndex + 1);
        }, 300);
      } else {
        // Attendre un peu avant de soumettre
        setTimeout(() => {
          onSubmit(updatedMeals);
        }, 500);
      }
    }, 800);
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else {
      onPrev();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        Qu'est-ce que tu veux manger ?
      </h2>
      
      {/* Jour actuel avec animation */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <p className="text-xl text-[var(--primary)] font-medium mb-8">{currentDay}</p>
      </div>

      {/* Message de confirmation */}
      {showConfirmation && (
        <div className="mb-4 px-6 py-3 bg-green-100 text-green-700 rounded-2xl flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Parfait ! {currentDayIndex < selectedDays.length - 1 ? 'Passons au jour suivant...' : 'Terminé !'}</span>
        </div>
      )}

      {/* Grille de plats avec animation */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {MEALS.map((meal) => (
          <button
            key={meal}
            onClick={() => handleMealSelect(meal)}
            disabled={showConfirmation}
            className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
              meals[currentDay] === meal
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-gray-100 text-foreground hover:bg-gray-200'
            } ${showConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {meal}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevDay}
          disabled={showConfirmation}
          className={`px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all ${
            showConfirmation ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Précédent
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Jour {currentDayIndex + 1} sur {selectedDays.length}
      </div>
    </div>
  );
}
