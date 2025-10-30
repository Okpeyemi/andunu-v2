'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardHeader() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    loadAdminInfo();
  }, []);

  const loadAdminInfo = async () => {
    // Essayer de récupérer depuis sessionStorage
    const name = sessionStorage.getItem('adminName');
    const email = sessionStorage.getItem('adminEmail');

    if (name && email) {
      setAdminName(name);
      setAdminEmail(email);
    } else {
      // Sinon, récupérer depuis Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setAdminName(profile.full_name);
          setAdminEmail(session.user.email || '');
          sessionStorage.setItem('adminName', profile.full_name);
          sessionStorage.setItem('adminEmail', session.user.email || '');
        }
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminRole');
    sessionStorage.removeItem('adminName');
    router.push('/console');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-sm text-gray-500">{adminName || adminEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
