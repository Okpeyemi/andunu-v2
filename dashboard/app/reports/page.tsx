'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type StatistiquesTempsReel, type Rapport } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import Spinner from '@/components/Spinner';
import NotificationModal from '@/components/NotificationModal';

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatistiquesTempsReel | null>(null);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filtres pour générer un rapport
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Notification
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    checkAuth();
    loadStatistics();
    loadReports();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/console');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      router.push('/');
      return;
    }
  };

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Charger les statistiques en temps réel depuis la vue
      const { data, error } = await supabase
        .from('statistiques_temps_reel')
        .select('*')
        .single();

      if (error) {
        // Si la vue n'existe pas encore, calculer manuellement
        const { data: commandes } = await supabase
          .from('commandes')
          .select('*');

        if (commandes) {
          const statsCalculees: StatistiquesTempsReel = {
            total_commandes: commandes.length,
            total_revenus: commandes.reduce((sum, c) => sum + c.montant_total, 0),
            total_clients: new Set(commandes.map(c => c.client_telephone)).size,
            nouveaux_clients_30j: new Set(
              commandes
                .filter(c => new Date(c.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                .map(c => c.client_telephone)
            ).size,
            commandes_en_attente: commandes.filter(c => c.statut === 'en_attente').length,
            commandes_confirmees: commandes.filter(c => c.statut === 'confirmee').length,
            commandes_en_preparation: commandes.filter(c => c.statut === 'en_preparation').length,
            commandes_en_livraison: commandes.filter(c => c.statut === 'en_livraison').length,
            commandes_livrees: commandes.filter(c => c.statut === 'livree').length,
            commandes_annulees: commandes.filter(c => c.statut === 'annulee').length,
            paiements_reussis: commandes.filter(c => c.statut_paiement === 'paid').length,
            paiements_en_attente: commandes.filter(c => c.statut_paiement === 'pending').length,
            paiements_echoues: commandes.filter(c => c.statut_paiement === 'failed').length,
          };
          setStats(statsCalculees);
        }
      } else {
        setStats(data);
      }
    } catch (err: any) {
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('rapports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur chargement rapports:', error);
        return;
      }

      setRapports(data || []);
    } catch (err: any) {
      console.error('Erreur:', err);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      let debut: string;
      let fin: string;
      const today = new Date();

      // Calculer les dates selon le type
      switch (reportType) {
        case 'daily':
          debut = today.toISOString().split('T')[0];
          fin = debut;
          break;
        case 'weekly':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          debut = weekAgo.toISOString().split('T')[0];
          fin = today.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          debut = monthAgo.toISOString().split('T')[0];
          fin = today.toISOString().split('T')[0];
          break;
        case 'custom':
          if (!startDate || !endDate) {
            setNotification({
              isOpen: true,
              type: 'error',
              title: 'Erreur',
              message: 'Veuillez sélectionner les dates de début et de fin'
            });
            return;
          }
          debut = startDate;
          fin = endDate;
          break;
      }

      // Appeler la fonction Supabase pour générer le rapport
      // Note: les paramètres doivent être dans l'ordre de la définition de la fonction
      const { data, error } = await supabase.rpc('generer_rapport', {
        p_type: reportType,
        p_periode_debut: debut,
        p_periode_fin: fin,
        p_genere_par: session.user.id
      });

      if (error) throw error;

      setShowGenerateModal(false);
      await loadReports();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Rapport généré',
        message: 'Le rapport a été créé avec succès'
      });
    } catch (err: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Impossible de générer le rapport'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToJSON = (rapport: Rapport) => {
    const data = {
      titre: rapport.titre,
      periode: `${rapport.periode_debut} - ${rapport.periode_fin}`,
      statistiques: {
        commandes: rapport.total_commandes,
        revenus: `${rapport.total_revenus} FCFA`,
        clients: rapport.total_clients,
        nouveaux_clients: rapport.nouveaux_clients
      },
      statuts: {
        en_attente: rapport.commandes_en_attente,
        confirmees: rapport.commandes_confirmees,
        en_preparation: rapport.commandes_en_preparation,
        en_livraison: rapport.commandes_en_livraison,
        livrees: rapport.commandes_livrees,
        annulees: rapport.commandes_annulees
      },
      paiements: {
        reussis: rapport.paiements_reussis,
        en_attente: rapport.paiements_en_attente,
        echoues: rapport.paiements_echoues
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${rapport.type}-${rapport.periode_debut}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (rapport: Rapport) => {
    // Créer les lignes CSV
    const csvLines = [
      ['Rapport', rapport.titre],
      ['Type', rapport.type],
      ['Période', `${new Date(rapport.periode_debut).toLocaleDateString('fr-FR')} - ${new Date(rapport.periode_fin).toLocaleDateString('fr-FR')}`],
      ['Date de génération', new Date(rapport.created_at).toLocaleDateString('fr-FR')],
      [],
      ['STATISTIQUES GÉNÉRALES'],
      ['Total commandes', rapport.total_commandes],
      ['Revenus totaux', `${rapport.total_revenus} FCFA`],
      ['Total clients', rapport.total_clients],
      ['Nouveaux clients', rapport.nouveaux_clients],
      [],
      ['STATUTS DES COMMANDES'],
      ['En attente', rapport.commandes_en_attente],
      ['Confirmées', rapport.commandes_confirmees],
      ['En préparation', rapport.commandes_en_preparation],
      ['En livraison', rapport.commandes_en_livraison],
      ['Livrées', rapport.commandes_livrees],
      ['Annulées', rapport.commandes_annulees],
      [],
      ['STATUTS DES PAIEMENTS'],
      ['Réussis', rapport.paiements_reussis],
      ['En attente', rapport.paiements_en_attente],
      ['Échoués', rapport.paiements_echoues],
    ];

    // Convertir en CSV
    const csvContent = csvLines.map(line => line.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${rapport.type}-${rapport.periode_debut}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (rapport: Rapport) => {
    // Créer le contenu HTML pour le PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport ${rapport.type}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Poppins', Arial, sans-serif;
            padding: 40px;
            color: #250B00;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 3px solid #7a2300;
          }
          .header h1 {
            color: #7a2300;
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 10px;
          }
          .section-title {
            background-color: #7a2300;
            color: white;
            padding: 10px 15px;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 10px;
          }
          .stat-item {
            border: 1px solid #e0e0e0;
            padding: 15px;
            border-radius: 8px;
          }
          .stat-label {
            color: #666;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .stat-value {
            color: #250B00;
            font-size: 24px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
            color: #7a2300;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${rapport.titre}</h1>
          <p>Période: ${new Date(rapport.periode_debut).toLocaleDateString('fr-FR')} - ${new Date(rapport.periode_fin).toLocaleDateString('fr-FR')}</p>
          <p>Généré le: ${new Date(rapport.created_at).toLocaleDateString('fr-FR')} à ${new Date(rapport.created_at).toLocaleTimeString('fr-FR')}</p>
        </div>

        <div class="section">
          <div class="section-title">Statistiques Générales</div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Total Commandes</div>
              <div class="stat-value">${rapport.total_commandes}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Revenus Totaux</div>
              <div class="stat-value">${rapport.total_revenus.toLocaleString()} FCFA</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Clients</div>
              <div class="stat-value">${rapport.total_clients}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Nouveaux Clients</div>
              <div class="stat-value">${rapport.nouveaux_clients}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Statuts des Commandes</div>
          <table>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Nombre</th>
                <th>Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>En attente</td>
                <td>${rapport.commandes_en_attente}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.commandes_en_attente / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Confirmées</td>
                <td>${rapport.commandes_confirmees}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.commandes_confirmees / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>En préparation</td>
                <td>${rapport.commandes_en_preparation}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.commandes_en_preparation / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>En livraison</td>
                <td>${rapport.commandes_en_livraison}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.commandes_en_livraison / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Livrées</td>
                <td>${rapport.commandes_livrees}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.commandes_livrees / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Annulées</td>
                <td>${rapport.commandes_annulees}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.commandes_annulees / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Statuts des Paiements</div>
          <table>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Nombre</th>
                <th>Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Réussis</td>
                <td>${rapport.paiements_reussis}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.paiements_reussis / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>En attente</td>
                <td>${rapport.paiements_en_attente}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.paiements_en_attente / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Échoués</td>
                <td>${rapport.paiements_echoues}</td>
                <td>${rapport.total_commandes > 0 ? ((rapport.paiements_echoues / rapport.total_commandes) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>© 2025 Andunu - Rapport généré automatiquement</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rapports & Statistiques</h1>
              <p className="text-gray-600 mt-1">Analysez les performances de votre activité</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] cursor-pointer text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Générer un rapport
            </button>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Commandes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stats.total_commandes}</h3>
              <p className="text-sm text-gray-600 mt-1">Total commandes</p>
            </div>

            {/* Total Revenus */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stats.total_revenus.toLocaleString()} FCFA</h3>
              <p className="text-sm text-gray-600 mt-1">Revenus totaux</p>
            </div>

            {/* Total Clients */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stats.total_clients}</h3>
              <p className="text-sm text-gray-600 mt-1">Clients uniques</p>
            </div>

            {/* Nouveaux Clients */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stats.nouveaux_clients_30j}</h3>
              <p className="text-sm text-gray-600 mt-1">Nouveaux (30j)</p>
            </div>
          </div>
        )}

        {/* Graphiques des statuts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Statuts des commandes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-foreground mb-4">Statuts des commandes</h3>
              <div className="space-y-3">
                <StatBar label="En attente" value={stats.commandes_en_attente} total={stats.total_commandes} color="bg-yellow-500" />
                <StatBar label="Confirmées" value={stats.commandes_confirmees} total={stats.total_commandes} color="bg-blue-500" />
                <StatBar label="En préparation" value={stats.commandes_en_preparation} total={stats.total_commandes} color="bg-purple-500" />
                <StatBar label="En livraison" value={stats.commandes_en_livraison} total={stats.total_commandes} color="bg-indigo-500" />
                <StatBar label="Livrées" value={stats.commandes_livrees} total={stats.total_commandes} color="bg-green-500" />
                <StatBar label="Annulées" value={stats.commandes_annulees} total={stats.total_commandes} color="bg-red-500" />
              </div>
            </div>

            {/* Statuts des paiements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-foreground mb-4">Statuts des paiements</h3>
              <div className="space-y-3">
                <StatBar label="Réussis" value={stats.paiements_reussis} total={stats.total_commandes} color="bg-green-500" />
                <StatBar label="En attente" value={stats.paiements_en_attente} total={stats.total_commandes} color="bg-yellow-500" />
                <StatBar label="Échoués" value={stats.paiements_echoues} total={stats.total_commandes} color="bg-red-500" />
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats.total_commandes > 0 
                      ? ((stats.paiements_reussis / stats.total_commandes) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des rapports générés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-foreground">Rapports générés</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenus</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rapports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Aucun rapport généré. Cliquez sur "Générer un rapport" pour commencer.
                    </td>
                  </tr>
                ) : (
                  rapports.map((rapport) => (
                    <tr key={rapport.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{rapport.titre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {rapport.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(rapport.periode_debut).toLocaleDateString('fr-FR')} - {new Date(rapport.periode_fin).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{rapport.total_commandes}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{rapport.total_revenus.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => exportToJSON(rapport)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-[var(--primary)] hover:bg-orange-50 cursor-pointer border border-gray-300 hover:border-[var(--primary)] rounded-lg transition-colors text-xs font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            JSON
                          </button>
                          <button
                            onClick={() => exportToCSV(rapport)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-[var(--primary)] hover:bg-orange-50 cursor-pointer border border-gray-300 hover:border-[var(--primary)] rounded-lg transition-colors text-xs font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            CSV
                          </button>
                          <button
                            onClick={() => exportToPDF(rapport)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-[var(--primary)] hover:bg-orange-50 cursor-pointer border border-gray-300 hover:border-[var(--primary)] rounded-lg transition-colors text-xs font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de génération de rapport */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Générer un rapport
            </h3>

            <div className="space-y-4 mb-6">
              {/* Type de rapport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de rapport
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="daily">Journalier</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>

              {/* Dates personnalisées */}
              {reportType === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? 'Génération...' : 'Générer'}
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notification */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </DashboardLayout>
  );
}

// Composant pour les barres de statistiques
function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
