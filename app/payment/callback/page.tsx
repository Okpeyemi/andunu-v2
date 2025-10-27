'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import Receipt from '@/components/Receipt';

interface OrderData {
  selectedDays: string[];
  meals: Record<string, string>;
  location: string;
  deliveryTime: string;
  userInfo: {
    fullName: string;
    phone: string;
  };
  paymentOption: 'daily' | 'weekly';
  amount: number;
}

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification du paiement...');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');

  useEffect(() => {
    const txId = searchParams.get('id');
    const paymentStatus = searchParams.get('status');

    if (!txId || !paymentStatus) {
      setStatus('error');
      setMessage('Informations de paiement manquantes');
      return;
    }

    setTransactionId(txId);

    // Récupérer les données de commande depuis localStorage
    const storedOrderData = localStorage.getItem('orderData');
    if (storedOrderData) {
      try {
        const parsedData = JSON.parse(storedOrderData);
        setOrderData(parsedData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    }

    // Traiter le statut du paiement
    if (paymentStatus === 'approved') {
      setStatus('success');
      setMessage('Paiement réussi ! Votre commande a été confirmée.');
      
      // Ne pas rediriger automatiquement pour permettre le téléchargement du reçu
    } else if (paymentStatus === 'canceled') {
      setStatus('error');
      setMessage('Paiement annulé. Vous pouvez réessayer.');
      
      // Rediriger vers la page de planification après 5 secondes
      setTimeout(() => {
        router.push('/planifier');
      }, 5000);
    } else {
      setStatus('error');
      setMessage('Statut de paiement inconnu.');
    }
  }, [searchParams, router]);

  // Si le paiement est réussi et qu'on a les données, afficher le reçu
  if (status === 'success' && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Message de succès */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Paiement réussi !</h1>
            <p className="text-gray-600 mb-6">Votre commande a été confirmée</p>
          </div>

          {/* Reçu */}
          <Receipt transactionId={transactionId} orderData={orderData} />

          {/* Bouton retour */}
          <div className="mt-8 text-center print:hidden">
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gray-200 text-foreground rounded-2xl hover:bg-gray-300 transition-all font-medium"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          andunu
        </h1>

        {/* Icône de statut */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex justify-center">
              <Spinner size="lg" className="text-[var(--primary)]" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          {status === 'success' && 'Paiement réussi !'}
          {status === 'error' && 'Paiement échoué'}
          {status === 'loading' && 'Vérification en cours...'}
        </h2>
        
        <p className="text-gray-600 mb-8">{message}</p>

        {/* Boutons d'action */}
        {status === 'error' && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-2xl text-sm font-medium bg-gray-200 text-foreground hover:bg-gray-300 transition-all"
            >
              Accueil
            </button>
            <button
              onClick={() => router.push('/planifier')}
              className="px-6 py-3 rounded-2xl text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
