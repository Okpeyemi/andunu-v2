'use client';

import { useState } from 'react';
import PhoneInput from '@/components/PhoneInput';

interface Step5UserInfoProps {
  onSubmit: (info: { fullName: string; phone: string }) => void;
  onPrev: () => void;
}

export default function Step5UserInfo({ onSubmit, onPrev }: Step5UserInfoProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Le nom complet est requis');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setError('Numéro de téléphone invalide');
      return;
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    // Passer au step suivant avec les infos
    onSubmit({ 
      fullName: fullName.trim(), 
      phone: formattedPhone
    });
  };

  const isValid = 
    fullName.trim() && 
    phone.trim() && 
    phone.length >= 10;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-8">
        Remplis tes informations
      </h2>

      <div className="w-full max-w-md space-y-6 mb-6">
        {/* Nom complet */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Entrez votre nom complet"
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone *
          </label>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            placeholder="Indicatif + numéro (ex: 22997000000)"
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg"
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="w-full max-w-md mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-2xl text-lg font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all"
        >
          Précédent
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all ${
            isValid
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
