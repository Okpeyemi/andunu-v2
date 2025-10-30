'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { supabase } from '@/lib/supabase';

export default function ConsolePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      setError('Adresse email invalide');
      return;
    }

    setIsSubmitting(true);

    try {
      // Authentification avec Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur trouvé');
      }

      console.log('Utilisateur connecté:', authData.user.id);

      // Attendre un peu pour que la session soit établie
      await new Promise(resolve => setTimeout(resolve, 500));

      // Récupérer le profil pour vérifier le rôle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Erreur profil:', profileError);
        throw new Error(`Impossible de récupérer le profil: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('Profil introuvable');
      }

      // Vérifier que l'utilisateur est un super_admin
      if (profile.role !== 'super_admin') {
        // Déconnecter l'utilisateur
        await supabase.auth.signOut();
        setError('Accès refusé. Seuls les super administrateurs peuvent accéder à cette console.');
        setIsSubmitting(false);
        return;
      }

      // Vérifier que le compte est actif
      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        setError('Votre compte est inactif. Contactez un administrateur.');
        setIsSubmitting(false);
        return;
      }

      // Mettre à jour la dernière connexion
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Enregistrer le log de connexion
      await supabase.rpc('create_log', {
        p_user_id: authData.user.id,
        p_action: 'login',
        p_entity_type: 'auth',
        p_entity_id: authData.user.id,
        p_description: `Connexion réussie de ${profile.full_name}`,
        p_metadata: {
          email: email,
          role: profile.role,
          ip: typeof window !== 'undefined' ? window.location.hostname : null
        },
        p_status: 'success'
      });

      // Sauvegarder les informations dans sessionStorage
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminEmail', email);
      sessionStorage.setItem('adminRole', profile.role);
      sessionStorage.setItem('adminName', profile.full_name);

      // Rediriger vers le dashboard admin
      router.push('/');
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Email ou mot de passe incorrect');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Console d'administration
          </h1>
          <p className="text-gray-600">
            Accès réservé aux administrateurs
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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
                  placeholder="admin@andunu.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Informations de test */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-600 font-mono mb-2">🔧 Mode développement</p>
              <p className="text-xs text-gray-600">Email: admin@andunu.com</p>
              <p className="text-xs text-gray-600">Mot de passe: Admin@2025!</p>
            </div>
          )}
        </div>

        {/* Lien retour */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
