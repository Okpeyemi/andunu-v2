'use client';

import { useState } from 'react';
import Spinner from '@/components/Spinner';

interface Step1DaySelectionProps {
  onSubmit: (days: string[]) => void;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function Step1DaySelection({ onSubmit }: Step1DaySelectionProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const currentDay = now.getDay();

  const getStartOfWeekMonday = (date: Date) => {
    const d = new Date(date);
    const jsDay = d.getDay() === 0 ? 7 : d.getDay();
    const diff = d.getDate() - jsDay + 1;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const shouldUseNextWeek = currentDay === 5 || currentDay === 6 || currentDay === 0;

  const baseMonday = (() => {
    const monday = getStartOfWeekMonday(now);
    if (shouldUseNextWeek) {
      monday.setDate(monday.getDate() + 7);
    }
    return monday;
  })();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const getDateForDayIndex = (index: number) => {
    const date = new Date(baseMonday);
    date.setDate(baseMonday.getDate() + index);
    return date;
  };

  const isDayDisabled = (date: Date) => {
    const isPastDay = date < startOfToday;
    const isSameDayAsToday = date.toDateString() === now.toDateString();
    const isAfterCutoffToday = isSameDayAsToday && now.getHours() >= 8;
    return isPastDay || isAfterCutoffToday;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (selectedDays.length > 0) {
      setIsSubmitting(true);
      // Petit délai pour montrer le spinner
      setTimeout(() => {
        onSubmit(selectedDays);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="max-w-2xl text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center mb-8">
        Quelles sont les jours que tu voudrais planifier ?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        {DAYS.map((day, index) => {
          const date = getDateForDayIndex(index);
          const disabled = isDayDisabled(date);
          const isSelected = selectedDays.includes(day);

          return (
            <button
              key={day}
              onClick={() => {
                if (disabled) return;
                toggleDay(day);
              }}
              disabled={disabled}
              className={`px-6 py-4 rounded-2xl text-lg font-medium transition-all flex flex-col items-center ${
                disabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isSelected
                  ? 'bg-[var(--primary)] text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
              }`}
            >
              <span>{day}</span>
              <span className="text-sm mt-1 opacity-80">{formatDate(date)}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedDays.length === 0 || isSubmitting}
        className={`px-8 py-3 rounded-2xl text-lg font-medium transition-all flex items-center gap-2 ${
          selectedDays.length > 0 && !isSubmitting
            ? 'bg-[var(--primary)] text-white hover:opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting && <Spinner size="sm" />}
        Suivant
      </button>

      {selectedDays.length > 0 && (
        <p className="mt-4 text-sm text-gray-600">
          {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''} sélectionné{selectedDays.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
