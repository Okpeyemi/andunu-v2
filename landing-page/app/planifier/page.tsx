'use client';

import { useState } from 'react';
import Image from 'next/image';
import Step1DaySelection from '@/components/planning/Step1DaySelection';
import Step2MealSelection from '@/components/planning/Step2MealSelection';
import Step3LocationSelection from '@/components/planning/Step3LocationSelection';
import Step4DeliveryTime from '@/components/planning/Step4DeliveryTime';
import Step5Motivation from '@/components/planning/Step5Motivation';
import Step6UserInfo from '@/components/planning/Step6UserInfo';
import Step7Payment from '@/components/planning/Step7Payment';
import DevPaymentInfo from '@/components/DevPaymentInfo';

interface MealDetails {
  mainDish: string;
  price: number;
}

export default function PlanifierPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [meals, setMeals] = useState<Record<string, MealDetails>>({});
  const [location, setLocation] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [userInfo, setUserInfo] = useState({ fullName: '', phone: '' });
  const [paymentOption, setPaymentOption] = useState<'daily' | 'weekly' | null>(null);

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDaysSubmit = (days: string[]) => {
    setSelectedDays(days);
    handleNext();
  };

  const handleMealsSubmit = (selectedMeals: Record<string, MealDetails>) => {
    setMeals(selectedMeals);
    handleNext();
  };

  const handleLocationSubmit = (loc: string) => {
    setLocation(loc);
    handleNext();
  };

  const handleDeliveryTimeSubmit = (time: string) => {
    setDeliveryTime(time);
    handleNext();
  };

  const handleUserInfoSubmit = (info: { fullName: string; phone: string }) => {
    setUserInfo(info);
    handleNext();
  };

  const handlePaymentSubmit = (option: 'daily' | 'weekly') => {
    setPaymentOption(option);
    // Ici vous pouvez rediriger vers une page de confirmation ou traiter le paiement
    console.log('Planification complète:', {
      selectedDays,
      meals,
      location,
      deliveryTime,
      userInfo,
      paymentOption
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Bouton d'aide pour le développement */}
      <DevPaymentInfo />
      
      {/* Logo en haut au centre */}
      <div className="flex justify-center pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground">
          andunu
        </h1>
      </div>

      {/* Indicateur de progression */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step === currentStep
                  ? 'bg-[var(--primary)]'
                  : step < currentStep
                  ? 'bg-[var(--primary)]/60'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          Étape {currentStep} sur 7
        </div>
      </div>

      {/* Contenu des étapes */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {currentStep === 1 && (
          <Step1DaySelection onSubmit={handleDaysSubmit} />
        )}
        {currentStep === 2 && (
          <Step2MealSelection
            selectedDays={selectedDays}
            onSubmit={handleMealsSubmit}
            onPrev={handlePrev}
          />
        )}
        {currentStep === 3 && (
          <Step3LocationSelection
            onSubmit={handleLocationSubmit}
            onPrev={handlePrev}
          />
        )}
        {currentStep === 4 && (
          <Step4DeliveryTime
            onSubmit={handleDeliveryTimeSubmit}
            onPrev={handlePrev}
          />
        )}
        {currentStep === 5 && (
          <Step5Motivation onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 6 && (
          <Step6UserInfo onSubmit={handleUserInfoSubmit} onPrev={handlePrev} />
        )}
        {currentStep === 7 && (
          <Step7Payment
            selectedDays={selectedDays}
            meals={meals}
            location={location}
            deliveryTime={deliveryTime}
            userInfo={userInfo}
            onSubmit={handlePaymentSubmit}
            onPrev={handlePrev}
          />
        )}
      </div>
    </div>
  );
}
