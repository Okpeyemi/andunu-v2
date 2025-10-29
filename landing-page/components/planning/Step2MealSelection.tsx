'use client';

import { useState, useEffect } from 'react';

interface MealDetails {
  mainDish: string;
  ingredients: string[];
}

interface Step2MealSelectionProps {
  selectedDays: string[];
  onSubmit: (meals: Record<string, MealDetails>) => void;
  onPrev: () => void;
}

// Liste de plats avec leurs accompagnements possibles
const MEALS_WITH_OPTIONS = {
  'Riz sauce': ['Poisson', 'Banane', 'Œuf', 'Viande', 'Poulet'],
  'Attiéké poisson': ['Poisson frit', 'Poisson braisé', 'Thon', 'Légumes', 'Piment'],
  'Alloco': ['Poisson', 'Œuf', 'Piment', 'Oignon'],
  'Poulet braisé': ['Attiéké', 'Riz', 'Frites', 'Alloco'],
  'Poisson braisé': ['Attiéké', 'Riz', 'Banane', 'Alloco'],
  'Foutou': ['Sauce graine', 'Sauce claire', 'Poisson', 'Viande'],
  'Placali': ['Sauce graine', 'Sauce claire', 'Poisson', 'Viande'],
  'Kedjenou': ['Riz', 'Attiéké', 'Alloco', 'Foutou'],
};

const MEALS = Object.keys(MEALS_WITH_OPTIONS);

export default function Step2MealSelection({
  selectedDays,
  onSubmit,
  onPrev,
}: Step2MealSelectionProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [meals, setMeals] = useState<Record<string, MealDetails>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

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
    setSelectedMeal(meal);
    setSelectedIngredients([]);
  };

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(i => i !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleConfirmMeal = () => {
    if (!selectedMeal || selectedIngredients.length === 0) return;

    const updatedMeals = { 
      ...meals, 
      [currentDay]: {
        mainDish: selectedMeal,
        ingredients: selectedIngredients
      }
    };
    setMeals(updatedMeals);

    // Afficher une confirmation visuelle
    setShowConfirmation(true);

    // Attendre avant de passer au jour suivant
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedMeal(null);
      setSelectedIngredients([]);
      
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

  const handleBackToMeals = () => {
    setSelectedMeal(null);
    setSelectedIngredients([]);
  };

  const handlePrevDay = () => {
    if (selectedMeal) {
      handleBackToMeals();
    } else if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else {
      onPrev();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        {selectedMeal ? 'Choisis tes accompagnements' : 'Qu\'est-ce que tu veux manger ?'}
      </h2>
      
      {/* Jour actuel avec animation */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <p className="text-xl text-[var(--primary)] font-medium mb-4">{currentDay}</p>
        {selectedMeal && (
          <p className="text-lg text-gray-600 mb-4">
            {selectedMeal}
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

      {/* Grille de plats ou d'ingrédients avec animation */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {!selectedMeal ? (
          // Affichage des plats principaux
          MEALS.map((meal) => (
            <button
              key={meal}
              onClick={() => handleMealSelect(meal)}
              disabled={showConfirmation}
              className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                meals[currentDay]?.mainDish === meal
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
              } ${showConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {meal}
            </button>
          ))
        ) : (
          // Affichage des accompagnements (choix multiples)
          MEALS_WITH_OPTIONS[selectedMeal as keyof typeof MEALS_WITH_OPTIONS]?.map((ingredient) => (
            <button
              key={ingredient}
              onClick={() => handleIngredientToggle(ingredient)}
              disabled={showConfirmation}
              className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                selectedIngredients.includes(ingredient)
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
              } ${showConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {ingredient}
              {selectedIngredients.includes(ingredient) && (
                <svg className="w-5 h-5 inline-block ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))
        )}
      </div>

      {/* Affichage du nombre d'ingrédients sélectionnés */}
      {selectedMeal && selectedIngredients.length > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          {selectedIngredients.length} accompagnement{selectedIngredients.length > 1 ? 's' : ''} sélectionné{selectedIngredients.length > 1 ? 's' : ''}
        </p>
      )}

      <div className="flex gap-4">
        <button
          onClick={handlePrevDay}
          disabled={showConfirmation}
          className={`px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all ${
            showConfirmation ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {selectedMeal ? 'Retour' : 'Précédent'}
        </button>

        {selectedMeal && (
          <button
            onClick={handleConfirmMeal}
            disabled={showConfirmation || selectedIngredients.length === 0}
            className={`px-6 py-3 rounded-2xl text-lg font-medium transition-all ${
              selectedIngredients.length > 0
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-gray-100 text-foreground hover:bg-gray-200'
            } ${showConfirmation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Confirmer
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Jour {currentDayIndex + 1} sur {selectedDays.length}
      </div>
    </div>
  );
}
