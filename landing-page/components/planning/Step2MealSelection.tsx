'use client';

import { useState, useEffect } from 'react';
import { getPacks, getRepas, transformRepasToMealWithPrices } from '@/lib/services/meals';
import type { Pack, Repas } from '@/lib/supabase';

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



export default function Step2MealSelection({
  selectedDays,
  onSubmit,
  onPrev,
}: Step2MealSelectionProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [meals, setMeals] = useState<Record<string, MealDetails>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  
  // États pour les données dynamiques
  const [packs, setPacks] = useState<Pack[]>([]);
  const [repas, setRepas] = useState<Repas[]>([]);
  const [mealsWithPrices, setMealsWithPrices] = useState<MealWithPrices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDay = selectedDays[currentDayIndex];
  
  // Filtrer les plats selon le pack sélectionné
  const availableMeals = selectedPack 
    ? mealsWithPrices.filter(meal => meal.prices.includes(selectedPack.price))
    : [];

  // Chargement des données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [packsData, repasData] = await Promise.all([
          getPacks(),
          getRepas()
        ]);
        
        setPacks(packsData);
        setRepas(repasData);
        setMealsWithPrices(transformRepasToMealWithPrices(repasData, packsData));
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Animation de transition entre les jours
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handlePackSelect = (pack: Pack) => {
    setSelectedPack(pack);
  };

  const handleMealSelect = (meal: string) => {
    if (!selectedPack) return;

    const updatedMeals = { 
      ...meals, 
      [currentDay]: {
        mainDish: meal,
        price: selectedPack.price
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
            {selectedPack.name} - {selectedPack.price} FCFA
          </p>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 px-6 py-3 bg-red-100 text-red-700 rounded-2xl flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

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
        {isLoading ? (
          // État de chargement
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : error ? (
          // État d'erreur
          <div className="col-span-full text-center py-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-2xl hover:opacity-90 transition-all"
            >
              Réessayer
            </button>
          </div>
        ) : !selectedPack ? (
          // Affichage des packs
          packs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun pack disponible</h3>
              <p className="text-gray-500 mb-4">Il n'y a actuellement aucun pack configuré dans le système.</p>
              <p className="text-sm text-gray-400">Contactez l'administrateur pour ajouter des packs.</p>
            </div>
          ) : (
            packs.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handlePackSelect(pack)}
                disabled={showConfirmation}
                className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all bg-gray-100 text-foreground hover:bg-gray-200 ${
                  showConfirmation ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{pack.name}</div>
                  <div className="text-sm text-gray-600">{pack.price} FCFA</div>
                  {pack.description && (
                    <div className="text-xs text-gray-500 mt-1">{pack.description}</div>
                  )}
                </div>
              </button>
            ))
          )
        ) : (
          // Affichage des plats selon le pack
          availableMeals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun repas disponible</h3>
              <p className="text-gray-500 mb-4">Il n'y a aucun repas configuré pour ce pack ({selectedPack.name}).</p>
              <button
                onClick={handleBackToPacks}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
              >
                Choisir un autre pack
              </button>
            </div>
          ) : (
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
          )
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevDay}
          disabled={showConfirmation || isLoading}
          className={`px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all ${
            showConfirmation || isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
