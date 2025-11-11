'use client';

import { useState, useEffect } from 'react';

interface MealDetails {
  mainDish: string;
  price: number;
}

interface Step2MealSelectionProps {
  selectedDays: string[];
  onSubmit: (meals: Record<string, MealDetails>) => void;
  onPrev: () => void;
}

interface MealWithPrices {
  name: string;
  prices: number[];
}

// Packs disponibles
const PACKS = [100, 1500, 2000];

// Liste de plats avec leurs prix
const MEALS_WITH_PRICES: MealWithPrices[] = [
  { name: 'Riz sauce poisson', prices: [100, 1500] },
  { name: 'Riz sauce banane', prices: [100] },
  { name: 'Riz sauce œuf', prices: [100, 1500] },
  { name: 'Riz sauce viande', prices: [1500, 2000] },
  { name: 'Riz sauce poulet', prices: [1500, 2000] },
  { name: 'Attiéké poisson frit', prices: [100, 1500] },
  { name: 'Attiéké poisson braisé', prices: [1500, 2000] },
  { name: 'Attiéké thon', prices: [100, 1500] },
  { name: 'Alloco poisson', prices: [100, 1500] },
  { name: 'Alloco œuf', prices: [100] },
  { name: 'Poulet braisé attiéké', prices: [1500, 2000] },
  { name: 'Poulet braisé riz', prices: [1500, 2000] },
  { name: 'Poulet braisé frites', prices: [2000] },
  { name: 'Poisson braisé attiéké', prices: [1500, 2000] },
  { name: 'Poisson braisé riz', prices: [1500, 2000] },
  { name: 'Foutou sauce graine', prices: [1500, 2000] },
  { name: 'Foutou sauce claire', prices: [100, 1500] },
  { name: 'Placali sauce graine', prices: [1500, 2000] },
  { name: 'Placali sauce claire', prices: [100, 1500] },
  { name: 'Kedjenou riz', prices: [2000] },
  { name: 'Kedjenou attiéké', prices: [2000] },
];

export default function Step2MealSelection({
  selectedDays,
  onSubmit,
  onPrev,
}: Step2MealSelectionProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [meals, setMeals] = useState<Record<string, MealDetails>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const currentDay = selectedDays[currentDayIndex];
  
  // Filtrer les plats selon le pack sélectionné
  const availableMeals = selectedPack 
    ? MEALS_WITH_PRICES.filter(meal => meal.prices.includes(selectedPack))
    : [];

  // Animation de transition entre les jours
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handlePackSelect = (pack: number) => {
    setSelectedPack(pack);
  };

  const handleMealSelect = (meal: string) => {
    if (!selectedPack) return;

    const updatedMeals = { 
      ...meals, 
      [currentDay]: {
        mainDish: meal,
        price: selectedPack
      }
    };
    setMeals(updatedMeals);

    // Afficher une confirmation visuelle
    setShowConfirmation(true);

    // Attendre avant de passer au jour suivant
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedPack(null); // Réinitialiser le pack pour le jour suivant
      
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

  const handleBackToPacks = () => {
    setSelectedPack(null);
  };

  const handlePrevDay = () => {
    if (selectedPack) {
      handleBackToPacks();
    } else if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else {
      onPrev();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        {!selectedPack ? 'Choisis ton pack' : 'Qu\'est-ce que tu veux manger ?'}
      </h2>
      
      {/* Jour actuel avec animation */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <p className="text-xl text-[var(--primary)] font-medium mb-4">{currentDay}</p>
        {selectedPack && (
          <p className="text-lg text-gray-600 mb-4">
            Pack {selectedPack} FCFA
          </p>
        )}
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

      {/* Grille de packs ou de plats avec animation */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {!selectedPack ? (
          // Affichage des packs
          PACKS.map((pack) => (
            <button
              key={pack}
              onClick={() => handlePackSelect(pack)}
              disabled={showConfirmation}
              className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all bg-gray-100 text-foreground hover:bg-gray-200 ${
                showConfirmation ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {pack} FCFA
            </button>
          ))
        ) : (
          // Affichage des plats selon le pack
          availableMeals.map((meal) => (
            <button
              key={meal.name}
              onClick={() => handleMealSelect(meal.name)}
              disabled={showConfirmation}
              className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                meals[currentDay]?.mainDish === meal.name
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
              } ${showConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {meal.name}
            </button>
          ))
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevDay}
          disabled={showConfirmation}
          className={`px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all ${
            showConfirmation ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {selectedPack ? 'Retour' : 'Précédent'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Jour {currentDayIndex + 1} sur {selectedDays.length}
      </div>
    </div>
  );
}
