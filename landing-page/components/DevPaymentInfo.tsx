'use client';

import { useState } from 'react';

export default function DevPaymentInfo() {
  const [isOpen, setIsOpen] = useState(false);
  
  // N'afficher qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        title="Infos de test FedaPay"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Modal d'information */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">
                🧪 Mode Test FedaPay
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Numéros de test (Sandbox)
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>✅ Approuvé :</span>
                    <code className="bg-blue-100 px-2 py-1 rounded">64000001</code>
                  </div>
                  <div className="flex justify-between">
                    <span>❌ Décliné :</span>
                    <code className="bg-blue-100 px-2 py-1 rounded">64000002</code>
                  </div>
                  <div className="flex justify-between">
                    <span>⏱️ En attente :</span>
                    <code className="bg-blue-100 px-2 py-1 rounded">64000003</code>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  ⚠️ Configuration requise
                </p>
                <p className="text-sm text-yellow-800">
                  Assurez-vous d'avoir configuré vos clés FedaPay dans <code className="bg-yellow-100 px-1 rounded">.env.local</code>
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  📚 Documentation
                </p>
                <p className="text-sm text-green-800">
                  Consultez <code className="bg-green-100 px-1 rounded">SETUP_FEDAPAY.md</code> pour plus d'infos
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
