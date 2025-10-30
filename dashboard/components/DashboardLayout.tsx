'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import Spinner from './Spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const checkAuth = () => {
      const isAdmin = sessionStorage.getItem('isAdmin');

      if (!isAdmin || isAdmin !== 'true') {
        router.replace('/console');
        return;
      }

      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  // Afficher un écran de chargement pendant la vérification
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content - avec padding pour la sidebar fixe */}
      <div className="dashboard-main-content lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
