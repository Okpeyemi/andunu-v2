"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      // When a user clicks the email reset link, Supabase creates a temporary recovery session
      const isRecovery = !!data.session;
      setHasRecoverySession(isRecovery);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.");
      setTimeout(() => router.replace("/console"), 1500);
    } catch (err: any) {
      setError(err.message || "Impossible de mettre à jour le mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRecoverySession === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11v4h12v-4c0-1.657-1.343-3-3-3s-3 1.343-3 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Définir un nouveau mot de passe</h1>
          <p className="text-gray-600">Veuillez saisir et confirmer votre nouveau mot de passe</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          {!hasRecoverySession && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
              Lien invalide ou expiré. Veuillez recommencer la procédure depuis « Mot de passe oublié ».
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">{message}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mettre à jour</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => router.push("/console")} className="text-sm text-[var(--primary)] hover:underline">
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
