'use client';

import { useState, useEffect } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, className, placeholder, disabled }: PhoneInputProps) {
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  useEffect(() => {
    validateAndFormat(value);
  }, [value]);

  const validateAndFormat = (phone: string) => {
    // Reset messages
    setError('');
    setHint('');

    if (!phone) {
      setHint('Format: indicatif + numéro (ex: 22997000000)');
      return;
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if starts with 229
    if (cleaned.startsWith('229')) {
      // Check if there's a 01 after 229
      if (cleaned.startsWith('22901')) {
        // Auto-correct: remove the 01
        const corrected = '229' + cleaned.substring(5);
        onChange(corrected);
        setHint('✓ Le "01" a été automatiquement retiré');
        return;
      }

      // Valid 229 format
      if (cleaned.length < 11) {
        setHint('Continuez à saisir votre numéro...');
      } else if (cleaned.length === 11) {
        setHint('✓ Numéro valide');
      } else {
        setError('Le numéro est trop long');
      }
    } else if (cleaned.startsWith('01')) {
      setError('Commencez par l\'indicatif (ex: 229)');
    } else if (cleaned.length > 0) {
      // Check if it might be another country code
      if (cleaned.length < 3) {
        setHint('Saisissez l\'indicatif complet...');
      } else {
        // Assume it's a valid international format
        if (cleaned.length < 10) {
          setHint('Continuez à saisir votre numéro...');
        } else {
          setHint('✓ Numéro valide');
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits
    const cleaned = input.replace(/\D/g, '');
    onChange(cleaned);
  };

  return (
    <div className="flex-1 w-full">
      <input 
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || 'Indicatif + numéro (ex: 22961916209)'}
        disabled={disabled}
        className={className}
      />
      {(error || hint) && (
        <p className={`text-xs mt-2 px-2 ${
          error ? 'text-red-500 font-medium' : 'text-gray-600'
        }`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
