"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubmitting(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const redirectTo = origin ? `${origin}/update-password` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;

      setMessage(
        "Un lien de réinitialisation vient d'être envoyé à votre adresse email. Veuillez consulter votre boîte de réception."
      );
    } catch (err: any) {
      setError(err.message || "Impossible d'envoyer l'email de réinitialisation");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">{message}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-3 3m3-3l-3-3" />
                  </svg>
                  <span>Envoyer le lien</span>
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
