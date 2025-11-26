'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';
import { supabase, type CreateCommandeInput, type MealDetails } from '@/lib/supabase';

interface Step7PaymentProps {
  selectedDays: string[];
  meals: Record<string, MealDetails>;
  location: string;
  deliveryTime: string;
  userInfo: { fullName: string; phone: string };
  onSubmit: (option: 'daily' | 'weekly') => void;
  onPrev: () => void;
}

export default function Step7Payment({
  selectedDays,
  meals,
  location,
  deliveryTime,
  userInfo,
  onSubmit,
  onPrev,
}: Step7PaymentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numberOfDays = selectedDays.length;

  // Calculer le sous-total des repas
  const mealsSubtotal = selectedDays.reduce((sum, day) => {
    return sum + (meals[day]?.price || 0);
  }, 0);

  // Frais de livraison (200 FCFA par jour)
  const deliveryFees = numberOfDays * 200;

  // Total avec livraison
  const totalAmount = mealsSubtotal + deliveryFees;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Utiliser le montant total directement
      const paymentAmount = totalAmount;

      // Préparer les données du client
      const [firstName, ...lastNameParts] = userInfo.fullName.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      // 1. Créer la commande dans Supabase
      const commandeData: CreateCommandeInput = {
        client_nom: userInfo.fullName,
        client_telephone: userInfo.phone,
        adresse_livraison: location,
        heure_livraison: deliveryTime,
        jours_selectionnes: selectedDays,
        repas: meals,
        mode_paiement: 'daily',
        montant_total: paymentAmount,
      };

      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .insert([commandeData])
        .select()
        .single();

      if (commandeError) {
        console.error('Erreur création commande:', commandeError);
        console.error('Détails erreur:', {
          message: commandeError.message,
          details: commandeError.details,
          hint: commandeError.hint,
          code: commandeError.code
        });
        throw new Error(`Erreur lors de la création de la commande: ${commandeError.message || 'Erreur inconnue'}`);
      }

      if (!commande) {
        throw new Error('Commande non créée');
      }

      // Sauvegarder l'ID de commande dans localStorage
      localStorage.setItem('commandeId', commande.id);

      // Sauvegarder les données de commande dans localStorage pour le reçu
      const orderData = {
        selectedDays,
        meals,
        location,
        deliveryTime,
        userInfo,
        paymentOption: 'daily',
        amount: paymentAmount,
        commandeId: commande.id,
      };
      localStorage.setItem('orderData', JSON.stringify(orderData));

      // 2. Créer la transaction FedaPay
      const response = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount,
          description: `Commande Andunu #${commande.id.slice(0, 8)} - ${numberOfDays} jour(s)`,
          customer: {
            firstname: firstName,
            lastname: lastName,
            phone: userInfo.phone,
          },
          metadata: {
            commandeId: commande.id,
            selectedDays: selectedDays.join(', '),
            meals: JSON.stringify(meals),
            location,
            deliveryTime,
            paymentOption: 'daily',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la transaction');
      }

      // 3. Mettre à jour la commande avec le transaction_id
      if (data.transactionId) {
        await supabase
          .from('commandes')
          .update({ transaction_id: data.transactionId })
          .eq('id', commande.id);
      }

      // 4. Rediriger vers la page de paiement FedaPay
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création du paiement. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
        Récapitulatif de ta commande
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Vérifie tes informations avant de choisir ton mode de paiement
      </p>

      {/* Récapitulatif */}
      <div className="w-full max-w-3xl mb-8 bg-gray-50 rounded-2xl p-6 space-y-6">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Informations personnelles
          </h3>
          <div className="pl-7 space-y-2 text-gray-700">
            <p><span className="font-medium">Nom :</span> {userInfo.fullName}</p>
            <p><span className="font-medium">Téléphone :</span> {userInfo.phone}</p>
          </div>
        </div>

        {/* Livraison */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            Livraison
          </h3>
          <div className="pl-7 space-y-2 text-gray-700">
            <p><span className="font-medium">Adresse :</span> {location}</p>
            <p><span className="font-medium">Heure :</span> {deliveryTime}</p>
          </div>
        </div>

        {/* Menu */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Ton menu
          </h3>
          <div className="pl-7 space-y-3">
            {selectedDays.map((day) => {
              const meal = meals[day];
              const accompanimentsTotal = meal?.accompagnements?.reduce((sum, acc) => sum + acc.price, 0) || 0;
              const mainDishPrice = (meal?.price || 0) - accompanimentsTotal;

              return (
                <div key={day} className="text-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-medium">{day} :</span>
                      <div className="mt-1">
                        <div className="flex justify-between items-center text-[var(--primary)] font-medium">
                          <span>{meal?.mainDish}</span>
                          <span className="text-sm text-gray-500">({mainDishPrice.toLocaleString()} FCFA)</span>
                        </div>
                        {meal?.accompagnements && meal.accompagnements!.length > 0 && (
                          <div className="mt-1 ml-4 space-y-1">
                            {meal.accompagnements!.map((acc, index) => (
                              <div key={`${acc.id}-${index}`} className="text-sm text-gray-600 flex justify-between">
                                <span>+ {acc.name}</span>
                                <span className="text-gray-500">({acc.price.toLocaleString()} FCFA)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="font-semibold text-gray-700">
                        {meal?.price?.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Montant total */}
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Effectue ton paiement
      </h3>

      <div className="w-full max-w-3xl mb-8">
        <div className="p-6 rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Montant à payer
          </h3>
          <div className="space-y-2 mb-4 text-gray-600">
            <div className="flex justify-between">
              <span>Sous-total repas ({numberOfDays} jours)</span>
              <span>{mealsSubtotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison (200 FCFA x {numberOfDays})</span>
              <span>{deliveryFees.toLocaleString()} FCFA</span>
            </div>
          </div>
          <div className="pt-4 border-t border-[var(--primary)]/20 flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <div className="text-3xl font-bold text-[var(--primary)]">
              {totalAmount.toLocaleString()} FCFA
            </div>
          </div>
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${!isSubmitting
            ? 'bg-[var(--primary)] text-white hover:opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isSubmitting && <Spinner size="sm" />}
          Payer {totalAmount.toLocaleString()} FCFA
        </button>
      </div>
    </div>
  );
}
