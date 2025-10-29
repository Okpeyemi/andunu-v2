'use client';

import { useRef } from 'react';

interface MealDetails {
  mainDish: string;
  ingredients: string[];
}

interface ReceiptProps {
  transactionId: string;
  orderData: {
    selectedDays: string[];
    meals: Record<string, MealDetails>;
    location: string;
    deliveryTime: string;
    userInfo: {
      fullName: string;
      phone: string;
    };
    paymentOption: 'daily' | 'weekly';
    amount: number;
  };
}

export default function Receipt({ transactionId, orderData }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    // Styles inline pour garantir l'affichage
    const inlineStyles = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 40px;
        background: white;
        color: #1f2937;
      }
      .receipt-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        padding: 40px;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 2px solid #e5e7eb;
      }
      .header h1 {
        font-size: 36px;
        font-weight: bold;
        color: #f97316;
        margin-bottom: 10px;
      }
      .header p {
        color: #6b7280;
        font-size: 14px;
      }
      .transaction-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        font-size: 14px;
      }
      .transaction-info div {
        flex: 1;
      }
      .transaction-info .right {
        text-align: right;
      }
      .transaction-info .label {
        color: #6b7280;
        margin-bottom: 5px;
      }
      .transaction-info .value {
        font-weight: 600;
        color: #1f2937;
      }
      .section {
        background: #f9fafb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 30px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-title svg {
        width: 20px;
        height: 20px;
        fill: #f97316;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;
      }
      .info-row:last-child {
        margin-bottom: 0;
      }
      .info-row .label {
        color: #6b7280;
      }
      .info-row .value {
        font-weight: 500;
        color: #1f2937;
        text-align: right;
      }
      .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .menu-item .day {
        font-weight: 500;
        color: #1f2937;
      }
      .menu-item .meal {
        color: #f97316;
        font-weight: 500;
      }
      .payment-summary {
        border-top: 2px solid #e5e7eb;
        padding-top: 24px;
        margin-top: 30px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        font-size: 14px;
      }
      .summary-row .label {
        color: #6b7280;
      }
      .summary-row .value {
        font-weight: 500;
        color: #1f2937;
      }
      .summary-row.discount {
        color: #10b981;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        margin-top: 16px;
      }
      .total-row .label {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      .total-row .value {
        font-size: 24px;
        font-weight: bold;
        color: #f97316;
      }
      .footer {
        margin-top: 40px;
        padding-top: 30px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
      .footer p {
        margin-bottom: 8px;
      }
      .footer .small {
        font-size: 12px;
        margin-top: 16px;
      }
      @media print {
        body {
          padding: 20px;
        }
        .receipt-container {
          border: none;
        }
      }
    `;

    // Générer le HTML avec les données
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu Andunu - ${transactionId}</title>
          <meta charset="utf-8">
          <style>${inlineStyles}</style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- En-tête -->
            <div class="header">
              <h1>andunu</h1>
              <p>Reçu de commande</p>
            </div>

            <!-- Informations de transaction -->
            <div class="transaction-info">
              <div>
                <p class="label">Numéro de transaction</p>
                <p class="value">#${transactionId}</p>
              </div>
              <div class="right">
                <p class="label">Date</p>
                <p class="value">${formatDate()}</p>
              </div>
            </div>

            <!-- Informations client -->
            <div class="section">
              <h3 class="section-title">
                <svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                Informations client
              </h3>
              <div class="info-row">
                <span class="label">Nom :</span>
                <span class="value">${orderData.userInfo.fullName}</span>
              </div>
              <div class="info-row">
                <span class="label">Téléphone :</span>
                <span class="value">${orderData.userInfo.phone}</span>
              </div>
            </div>

            <!-- Détails de livraison -->
            <div class="section">
              <h3 class="section-title">
                <svg viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>
                Détails de livraison
              </h3>
              <div class="info-row">
                <span class="label">Adresse :</span>
                <span class="value">${orderData.location}</span>
              </div>
              <div class="info-row">
                <span class="label">Heure :</span>
                <span class="value">${orderData.deliveryTime}</span>
              </div>
            </div>

            <!-- Menu commandé -->
            <div>
              <h3 class="section-title">
                <svg viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>
                Votre menu
              </h3>
              ${orderData.selectedDays.map(day => `
                <div class="menu-item">
                  <span class="day">${day}</span>
                  <span class="meal">${orderData.meals[day]?.mainDish || 'Non défini'}</span>
                </div>
              `).join('')}
            </div>

            <!-- Résumé du paiement -->
            <div class="payment-summary">
              <div class="summary-row">
                <span class="label">Mode de paiement :</span>
                <span class="value">${orderData.paymentOption === 'daily' ? 'Paiement par jour' : 'Paiement hebdomadaire'}</span>
              </div>
              <div class="summary-row">
                <span class="label">Nombre de jours :</span>
                <span class="value">${orderData.selectedDays.length}</span>
              </div>
              ${orderData.paymentOption === 'weekly' ? `
                <div class="summary-row discount">
                  <span class="label">Réduction (10%) :</span>
                  <span class="value">-${Math.round(orderData.amount * 0.1 / 0.9)} FCFA</span>
                </div>
              ` : ''}
              
              <div class="total-row">
                <span class="label">Total payé :</span>
                <span class="value">${orderData.amount.toLocaleString()} FCFA</span>
              </div>
            </div>

            <!-- Pied de page -->
            <div class="footer">
              <p>Merci pour votre commande !</p>
              <p>Pour toute question, contactez-nous sur WhatsApp</p>
              <p class="small">andunu - Ta bouffe à ta portée</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Bouton de téléchargement */}
      <div className="mb-6 flex justify-center print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-2xl hover:opacity-90 transition-all font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger le reçu
        </button>
      </div>

      {/* Reçu */}
      <div
        ref={receiptRef}
        className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg print:shadow-none print:border-0"
      >
        {/* En-tête */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-4xl font-bold text-[var(--primary)] mb-2">andunu</h1>
          <p className="text-gray-600">Reçu de commande</p>
        </div>

        {/* Informations de transaction */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Numéro de transaction</p>
              <p className="font-semibold text-foreground">#{transactionId}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-foreground">{formatDate()}</p>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Informations client
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nom :</span>
              <span className="font-medium text-foreground">{orderData.userInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone :</span>
              <span className="font-medium text-foreground">{orderData.userInfo.phone}</span>
            </div>
          </div>
        </div>

        {/* Détails de livraison */}
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            Détails de livraison
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Adresse :</span>
              <span className="font-medium text-foreground text-right">{orderData.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Heure :</span>
              <span className="font-medium text-foreground">{orderData.deliveryTime}</span>
            </div>
          </div>
        </div>

        {/* Menu commandé */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Votre menu
          </h3>
          <div className="space-y-3">
            {orderData.selectedDays.map((day) => (
              <div
                key={day}
                className="py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{day}</span>
                  <span className="text-[var(--primary)] font-medium">{orderData.meals[day]?.mainDish || 'Non défini'}</span>
                </div>
                {orderData.meals[day]?.ingredients && orderData.meals[day].ingredients.length > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    Avec : {orderData.meals[day].ingredients.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Résumé du paiement */}
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mode de paiement :</span>
              <span className="font-medium text-foreground">
                {orderData.paymentOption === 'daily' ? 'Paiement par jour' : 'Paiement hebdomadaire'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Nombre de jours :</span>
              <span className="font-medium text-foreground">{orderData.selectedDays.length}</span>
            </div>
            {orderData.paymentOption === 'weekly' && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction (10%) :</span>
                <span className="font-medium">-{Math.round(orderData.amount * 0.1 / 0.9)} FCFA</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold text-foreground">Total payé :</span>
            <span className="text-2xl font-bold text-[var(--primary)]">
              {orderData.amount.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p className="mb-2">Merci pour votre commande !</p>
          <p>Pour toute question, contactez-nous sur WhatsApp</p>
          <p className="mt-4 text-xs">andunu - Ta bouffe à ta portée</p>
        </div>
      </div>

      {/* Style d'impression */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
