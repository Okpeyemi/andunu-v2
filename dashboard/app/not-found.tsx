'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration 404 */}
        <div className="mb-8">
          <div className="relative">
            {/* Grand 404 */}
            <h1 className="text-[150px] md:text-[200px] font-bold text-gray-200 leading-none select-none">
              404
            </h1>
          </div>
        </div>

        {/* Texte */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page introuvable
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <p className="text-base text-gray-500">
            Vérifiez l'URL ou retournez à l'accueil du dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Aller au Dashboard
          </Link>
        </div>

        {/* Liens utiles */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Pages fréquemment visitées :</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/users"
              className="px-4 py-2 text-sm text-gray-600 hover:text-[var(--primary)] hover:bg-orange-50 rounded-lg transition-all"
            >
              Utilisateurs
            </Link>
            <Link
              href="/orders"
              className="px-4 py-2 text-sm text-gray-600 hover:text-[var(--primary)] hover:bg-orange-50 rounded-lg transition-all"
            >
              Commandes
            </Link>
            <Link
              href="/meals"
              className="px-4 py-2 text-sm text-gray-600 hover:text-[var(--primary)] hover:bg-orange-50 rounded-lg transition-all"
            >
              Repas
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2 text-sm text-gray-600 hover:text-[var(--primary)] hover:bg-orange-50 rounded-lg transition-all"
            >
              Rapports
            </Link>
            <Link
              href="/settings"
              className="px-4 py-2 text-sm text-gray-600 hover:text-[var(--primary)] hover:bg-orange-50 rounded-lg transition-all"
            >
              Paramètres
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-xs text-gray-400">
            Si vous pensez qu'il s'agit d'une erreur, contactez le support technique.
          </p>
        </div>
      </div>
    </div>
  );
}
