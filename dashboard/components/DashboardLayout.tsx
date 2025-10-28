'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const isAdmin = sessionStorage.getItem('isAdmin');

    if (!isAdmin || isAdmin !== 'true') {
      router.push('/console');
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
