'use client';

import { useState, useEffect } from 'react';
import { getRepas, getAccompagnementsForRepas } from '@/lib/services/meals';
import type { Repas, Accompagnement, MealDetails } from '@/lib/supabase';

interface Step2MealSelectionProps {
  selectedDays: string[];
  onSubmit: (meals: Record<string, MealDetails>) => void;
  onPrev: () => void;
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

  // États pour la sélection
  const [selectedRepas, setSelectedRepas] = useState<Repas | null>(null);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number>(0);
  const [selectedAccompagnements, setSelectedAccompagnements] = useState<Accompagnement[]>([]);

  // États pour les données dynamiques
  const [repas, setRepas] = useState<Repas[]>([]);
  const [availableAccompagnements, setAvailableAccompagnements] = useState<Accompagnement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAccompagnements, setIsLoadingAccompagnements] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDay = selectedDays[currentDayIndex];

  // Chargement des repas depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const repasData = await getRepas();
        setRepas(repasData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Chargement des accompagnements quand un repas est sélectionné
  useEffect(() => {
    const loadAccompagnements = async () => {
      if (!selectedRepas) {
        setAvailableAccompagnements([]);
        return;
      }

      try {
        setIsLoadingAccompagnements(true);
        const accompagnements = await getAccompagnementsForRepas(selectedRepas.id);
        setAvailableAccompagnements(accompagnements);
      } catch (err) {
        console.error('Erreur lors du chargement des accompagnements:', err);
        setAvailableAccompagnements([]);
      } finally {
        setIsLoadingAccompagnements(false);
      }
    };

    loadAccompagnements();
  }, [selectedRepas]);

  // Animation de transition entre les jours
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleRepasSelect = (repas: Repas) => {
    setSelectedRepas(repas);
    setSelectedPriceIndex(0); // Sélectionner le premier prix par défaut
    setSelectedAccompagnements([]); // Réinitialiser les accompagnements
  };

  const handlePriceSelect = (index: number) => {
    setSelectedPriceIndex(index);
  };

  const handleAccompagnementToggle = (accompagnement: Accompagnement) => {
    setSelectedAccompagnements(prev => {
      const isSelected = prev.some(a => a.id === accompagnement.id);
      if (isSelected) {
        return prev.filter(a => a.id !== accompagnement.id);
      } else {
        return [...prev, accompagnement];
      }
    });
  };

  const handleConfirmMeal = () => {
    if (!selectedRepas) return;

    const selectedPrice = selectedRepas.prices[selectedPriceIndex];
    const accompagnementsTotal = selectedAccompagnements.reduce((sum, acc) => sum + acc.price, 0);
    const totalPrice = selectedPrice + accompagnementsTotal;

    const updatedMeals = {
      ...meals,
      [currentDay]: {
        mainDish: selectedRepas.name,
        price: totalPrice,
        accompagnements: selectedAccompagnements.map(acc => ({
          id: acc.id,
          name: acc.name,
          price: acc.price
        }))
      }
    };
    setMeals(updatedMeals);

    // Afficher une confirmation visuelle
    setShowConfirmation(true);

    // Attendre avant de passer au jour suivant
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedRepas(null);
      setSelectedAccompagnements([]);
      setSelectedPriceIndex(0);

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

  const handleBackToRepas = () => {
    setSelectedRepas(null);
    setSelectedAccompagnements([]);
    setSelectedPriceIndex(0);
  };

  const handlePrevDay = () => {
    if (selectedRepas) {
      handleBackToRepas();
    } else if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else {
      onPrev();
    }
  };

  // Calculer le prix total actuel
  const getCurrentPrice = () => {
    if (!selectedRepas) return 0;
    const basePrice = selectedRepas.prices[selectedPriceIndex];
    const accompagnementsTotal = selectedAccompagnements.reduce((sum, acc) => sum + acc.price, 0);
    return basePrice + accompagnementsTotal;
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        {!selectedRepas ? 'Choisis ton repas' : 'Ajoute des accompagnements'}
      </h2>

      {/* Jour actuel avec animation */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <p className="text-xl text-[var(--primary)] font-medium mb-4">{currentDay}</p>
        {selectedRepas && (
          <div className="text-center mb-4">
            <p className="text-lg text-gray-700 font-medium">{selectedRepas.name}</p>
            <p className="text-md text-gray-600">
              {selectedRepas.prices[selectedPriceIndex].toLocaleString()} FCFA
              {selectedAccompagnements.length > 0 && (
                <span className="text-[var(--primary)] ml-2">
                  + {selectedAccompagnements.reduce((sum, acc) => sum + acc.price, 0).toLocaleString()} FCFA
                </span>
              )}
            </p>
          </div>
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

      {/* Grille de repas ou d'accompagnements avec animation */}
      <div className={`w-full max-w-2xl mb-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
        {isLoading ? (
          // État de chargement
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : error ? (
          // État d'erreur
          <div className="text-center py-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-2xl hover:opacity-90 transition-all"
            >
              Réessayer
            </button>
          </div>
        ) : !selectedRepas ? (
          // Affichage des repas
          <div className="space-y-4">
            {repas.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun repas disponible</h3>
                <p className="text-gray-500 mb-4">Il n'y a actuellement aucun repas configuré dans le système.</p>
                <p className="text-sm text-gray-400">Contactez l'administrateur pour ajouter des repas.</p>
              </div>
            ) : (
              repas.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRepasSelect(r)}
                  disabled={showConfirmation}
                  className={`w-full px-6 py-4 rounded-2xl text-lg font-medium transition-all bg-gray-100 text-foreground hover:bg-gray-200 ${showConfirmation ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-gray-600">
                      {r.prices.length === 1
                        ? `${r.prices[0].toLocaleString()} FCFA`
                        : `${r.prices[0].toLocaleString()} - ${r.prices[r.prices.length - 1].toLocaleString()} FCFA`
                      }
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Affichage des options de prix et accompagnements
          <div className="space-y-6">
            {/* Sélection du prix si plusieurs options */}
            {selectedRepas.prices.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Choisis ta formule</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedRepas.prices.map((price, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceSelect(index)}
                      className={`px-4 py-3 rounded-xl text-md font-medium transition-all ${selectedPriceIndex === index
                          ? 'bg-[var(--primary)] text-white shadow-lg'
                          : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                    >
                      {price.toLocaleString()} FCFA
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accompagnements */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Accompagnements {availableAccompagnements.length > 0 && '(optionnels)'}
              </h3>

              {isLoadingAccompagnements ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                  <span className="ml-3 text-gray-600 text-sm">Chargement...</span>
                </div>
              ) : availableAccompagnements.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">Aucun accompagnement disponible pour ce repas</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableAccompagnements.map((acc) => {
                    const isSelected = selectedAccompagnements.some(a => a.id === acc.id);
                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleAccompagnementToggle(acc)}
                        className={`px-4 py-3 rounded-xl text-md transition-all ${isSelected
                            ? 'bg-[var(--primary)] text-white shadow-lg'
                            : 'bg-gray-100 text-foreground hover:bg-gray-200'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-left">
                            <div className="font-medium">{acc.name}</div>
                            {acc.description && (
                              <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                {acc.description}
                              </div>
                            )}
                          </div>
                          <div className="font-semibold ml-4">
                            +{acc.price.toLocaleString()} FCFA
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prix total et bouton de confirmation */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {getCurrentPrice().toLocaleString()} FCFA
                </span>
              </div>
              <button
                onClick={handleConfirmMeal}
                disabled={showConfirmation}
                className={`w-full px-6 py-4 rounded-2xl text-lg font-medium transition-all ${showConfirmation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-lg'
                  }`}
              >
                Confirmer ce repas
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevDay}
          disabled={showConfirmation || isLoading}
          className={`px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all ${showConfirmation || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {selectedRepas ? 'Retour' : 'Précédent'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Jour {currentDayIndex + 1} sur {selectedDays.length}
      </div>
    </div>
  );
}
