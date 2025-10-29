'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';
import { supabase, type CreateCommandeInput } from '@/lib/supabase';

interface MealDetails {
  mainDish: string;
  ingredients: string[];
}

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
  const [selectedOption, setSelectedOption] = useState<'daily' | 'weekly' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numberOfDays = selectedDays.length;
  const pricePerDay = 2000; // Prix exemple en FCFA
  const dailyTotal = pricePerDay;
  const weeklyTotal = pricePerDay * numberOfDays;
  const weeklyDiscount = Math.round(weeklyTotal * 0.1); // 10% de réduction
  const weeklyFinal = weeklyTotal - weeklyDiscount;

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);

    try {
      // Calculer le montant total
      const totalAmount = selectedOption === 'daily' ? dailyTotal : weeklyFinal;

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
        mode_paiement: selectedOption,
        montant_total: totalAmount,
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
        paymentOption: selectedOption,
        amount: totalAmount,
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
          amount: totalAmount,
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
            paymentOption: selectedOption,
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
          <div className="pl-7 space-y-2">
            {selectedDays.map((day) => (
              <div key={day} className="text-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{day} :</span>
                  <span className="text-[var(--primary)]">{meals[day]?.mainDish}</span>
                </div>
                {meals[day]?.ingredients && meals[day].ingredients.length > 0 && (
                  <div className="text-sm text-gray-500 ml-4 mt-1">
                    Avec : {meals[day].ingredients.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode de paiement */}
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Choisis ton mode de paiement
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
        {/* Option paiement par jour */}
        <button
          onClick={() => setSelectedOption('daily')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            selectedOption === 'daily'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">
              Paiement par jour
            </h3>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedOption === 'daily'
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-gray-300'
              }`}
            >
              {selectedOption === 'daily' && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Payez chaque jour individuellement
          </p>
          <div className="text-3xl font-bold text-[var(--primary)]">
            {dailyTotal.toLocaleString()} FCFA
            <span className="text-sm font-normal text-gray-600"> / jour</span>
          </div>
        </button>

        {/* Option paiement par semaine */}
        <button
          onClick={() => setSelectedOption('weekly')}
          className={`p-6 rounded-2xl border-2 transition-all text-left relative ${
            selectedOption === 'weekly'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            -10% 🎉
          </div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">
              Paiement hebdomadaire
            </h3>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedOption === 'weekly'
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-gray-300'
              }`}
            >
              {selectedOption === 'weekly' && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Payez pour {numberOfDays} jours et économisez
          </p>
          <div className="space-y-1">
            <div className="text-sm text-gray-500 line-through">
              {weeklyTotal.toLocaleString()} FCFA
            </div>
            <div className="text-3xl font-bold text-[var(--primary)]">
              {weeklyFinal.toLocaleString()} FCFA
              <span className="text-sm font-normal text-gray-600"> / semaine</span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              Économisez {weeklyDiscount.toLocaleString()} FCFA
            </div>
          </div>
        </button>
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
          disabled={!selectedOption || isSubmitting}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
            selectedOption && !isSubmitting
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting && <Spinner size="sm" />}
          Confirmer
        </button>
      </div>
    </div>
  );
}
