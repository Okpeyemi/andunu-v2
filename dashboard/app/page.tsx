'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Spinner from '@/components/Spinner';
import { supabase, type Commande, type Log } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    todayRevenue: 0,
    activeClients: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer toutes les commandes
      const { data: allCommandes, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur:', error);
        return;
      }

      setCommandes(allCommandes || []);

      // Calculer les statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCommandes = (allCommandes || []).filter(cmd => {
        const cmdDate = new Date(cmd.created_at);
        cmdDate.setHours(0, 0, 0, 0);
        return cmdDate.getTime() === today.getTime();
      });

      const todayRevenue = todayCommandes.reduce((sum, cmd) => sum + cmd.montant_total, 0);
      
      // Clients uniques (par téléphone)
      const uniqueClients = new Set((allCommandes || []).map(cmd => cmd.client_telephone));
      
      const pendingCommandes = (allCommandes || []).filter(cmd => cmd.statut === 'en_attente');

      setStats({
        today: todayCommandes.length,
        todayRevenue,
        activeClients: uniqueClients.size,
        pending: pendingCommandes.length,
      });

      // Récupérer les logs récents
      const { data: recentLogs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!logsError && recentLogs) {
        setLogs(recentLogs);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'confirmee':
        return 'bg-green-100 text-green-800';
      case 'en_preparation':
        return 'bg-blue-100 text-blue-800';
      case 'en_livraison':
        return 'bg-purple-100 text-purple-800';
      case 'livree':
        return 'bg-gray-100 text-gray-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmée';
      case 'en_preparation':
        return 'En préparation';
      case 'en_livraison':
        return 'En livraison';
      case 'livree':
        return 'Livrée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
      export: 'bg-yellow-100 text-yellow-800',
      import: 'bg-indigo-100 text-indigo-800',
      view: 'bg-cyan-100 text-cyan-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Création',
      update: 'Modification',
      delete: 'Suppression',
      login: 'Connexion',
      logout: 'Déconnexion',
      export: 'Export',
      import: 'Import',
      view: 'Consultation',
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? <Spinner size="sm" /> : stats.today}
            </h3>
            <p className="text-sm text-gray-600">Commandes aujourd'hui</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? <Spinner size="sm" /> : `${stats.todayRevenue.toLocaleString()} FCFA`}
            </h3>
            <p className="text-sm text-gray-600">Revenus du jour</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? <Spinner size="sm" /> : stats.activeClients}
            </h3>
            <p className="text-sm text-gray-600">Clients actifs</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? <Spinner size="sm" /> : stats.pending}
            </h3>
            <p className="text-sm text-gray-600">Commandes en attente</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/orders')}
              className="flex items-center gap-3 p-4 cursor-pointer border-2 border-gray-200 rounded-xl hover:border-[var(--primary)] hover:bg-orange-50 transition-all">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Nouvelle commande</span>
            </button>

            <button 
              onClick={() => router.push('/meals')}
              className="flex items-center gap-3 p-4 cursor-pointer border-2 border-gray-200 rounded-xl hover:border-[var(--primary)] hover:bg-orange-50 transition-all">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Ajouter un plat</span>
            </button>

            <button 
              onClick={() => router.push('/reports')}
              className="flex items-center gap-3 p-4 cursor-pointer border-2 border-gray-200 rounded-xl hover:border-[var(--primary)] hover:bg-orange-50 transition-all">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Voir les rapports</span>
            </button>

            <button 
              onClick={() => router.push('/users')}
              className="flex items-center gap-3 p-4 cursor-pointer border-2 border-gray-200 rounded-xl hover:border-[var(--primary)] hover:bg-orange-50 transition-all"
            >
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Gérer les utilisateurs</span>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
            <button
              onClick={() => router.push('/orders')}
              className="text-sm text-[var(--primary)] cursor-pointer hover:underline font-medium"
            >
              Voir tout
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 mb-2">Aucune commande pour le moment</p>
              <p className="text-sm text-gray-400">Les commandes apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commandes.slice(0, 5).map((commande) => (
                    <tr 
                      key={commande.id} 
                      onClick={() => router.push('/orders')}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {commande.client_nom}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {commande.client_telephone}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {commande.jours_selectionnes.length} jour(s)
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {commande.montant_total.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(commande.statut)}`}>
                          {getStatutLabel(commande.statut)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(commande.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activités récentes</h2>
            <button
              onClick={() => router.push('/logs')}
              className="text-sm text-[var(--primary)] cursor-pointer hover:underline font-medium"
            >
              Voir tout
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">Aucune activité pour le moment</p>
              <p className="text-sm text-gray-400">Les logs apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionBadge(log.action)}`}>
                    {log.action === 'create' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {log.action === 'update' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                    {log.action === 'delete' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {log.action === 'login' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    )}
                    {log.action === 'export' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    {!['create', 'update', 'delete', 'login', 'export'].includes(log.action) && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getActionBadge(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{log.description}</p>
                    <p className="text-xs text-gray-500">
                      Par: {log.user_name || log.user_email || 'Système'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
