'use client';

import { useState, useEffect } from 'react';
import { supabase, type Commande, type StatutCommande } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import Spinner from '@/components/Spinner';
import NotificationModal from '@/components/NotificationModal';

export default function OrdersPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
    fetchCommandes();
  }, []);

  useEffect(() => {
    filterCommandes();
  }, [searchTerm, statusFilter, commandes]);

  const fetchCommandes = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erreur:', fetchError);
        setError('Erreur lors du chargement des commandes');
        return;
      }

      setCommandes(data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCommandes = () => {
    let filtered = [...commandes];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(cmd =>
        cmd.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.client_telephone.includes(searchTerm) ||
        cmd.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cmd => cmd.statut === statusFilter);
    }

  };

  const handleUpdateStatus = async (commandeId: string, newStatus: StatutCommande) => {
    setIsUpdating(true);
    try {
      // Récupérer la commande avant modification
      const commandeToUpdate = commandes.find(c => c.id === commandeId);
      
      if (!commandeToUpdate) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Erreur',
          message: `La commande ${commandeId.slice(0, 8)} n'existe pas`
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('commandes')
        .update({ statut: newStatus })
        .eq('id', commandeId);

      if (updateError) {
        console.error('Erreur:', updateError);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la mise à jour du statut'
        });
        return;
      }

      // Enregistrer le log de modification
      const { data: { session } } = await supabase.auth.getSession();
      if (session && commandeToUpdate) {
        await supabase.rpc('create_log', {
          p_user_id: session.user.id,
          p_action: 'update',
          p_entity_type: 'order',
          p_entity_id: commandeId,
          p_description: `Changement de statut de commande ${commandeId.slice(0, 8)}: ${commandeToUpdate.statut} → ${newStatus}`,
          p_metadata: {
            client_nom: commandeToUpdate.client_nom,
            client_telephone: commandeToUpdate.client_telephone,
            old_status: commandeToUpdate.statut,
            new_status: newStatus,
            montant: commandeToUpdate.montant_total
          },
          p_status: 'success'
        });
      }

      // Mettre à jour localement
      setCommandes(prev =>
        prev.map(cmd =>
          cmd.id === commandeId ? { ...cmd, statut: newStatus } : cmd
        )
      );

      if (selectedCommande && selectedCommande.id === commandeId) {
        setSelectedCommande({ ...selectedCommande, statut: newStatus });
      }
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: 'Statut mis à jour avec succès'
      });
    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      });
    } finally {
      setIsUpdating(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statutOptions: StatutCommande[] = [
    'en_attente',
    'confirmee',
    'en_preparation',
    'en_livraison',
    'livree',
    'annulee',
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Commandes</h1>
          <p className="text-gray-600">Gérez toutes les commandes de la plateforme</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{commandes.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {commandes.filter(c => c.statut === 'en_attente').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">En cours</p>
            <p className="text-2xl font-bold text-blue-600">
              {commandes.filter(c => ['confirmee', 'en_preparation', 'en_livraison'].includes(c.statut)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Livrées</p>
            <p className="text-2xl font-bold text-green-600">
              {commandes.filter(c => c.statut === 'livree').length}
            </p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, téléphone ou ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="en_preparation">En préparation</option>
              <option value="en_livraison">En livraison</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>

            {/* Bouton rafraîchir */}
            <button
              onClick={fetchCommandes}
              className="px-4 py-2 bg-[var(--primary)] cursor-pointer text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rafraîchir
            </button>
          </div>
        </div>

        {/* Liste des commandes */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCommandes.map((commande) => (
                    <tr key={commande.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {commande.id.slice(0, 8)}
                      </td>
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedCommande(commande)}
                          className="text-[var(--primary)] cursor-pointer hover:underline text-sm font-medium"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de détails */}
        {selectedCommande && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Détails de la commande</h2>
                  <button
                    onClick={() => setSelectedCommande(null)}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* ID et statut */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">ID de commande</span>
                    <span className="font-mono text-sm font-medium">{selectedCommande.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut actuel</span>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatutColor(selectedCommande.statut)}`}>
                      {getStatutLabel(selectedCommande.statut)}
                    </span>
                  </div>
                </div>

                {/* Informations client */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Client</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom :</span>
                      <span className="font-medium">{selectedCommande.client_nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone :</span>
                      <span className="font-medium">{selectedCommande.client_telephone}</span>
                    </div>
                  </div>
                </div>

                {/* Livraison */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Livraison</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresse :</span>
                      <span className="font-medium text-right">{selectedCommande.adresse_livraison}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heure :</span>
                      <span className="font-medium">{selectedCommande.heure_livraison}</span>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Menu</h3>
                  <div className="space-y-2">
                    {selectedCommande.jours_selectionnes.map((jour) => (
                      <div key={jour} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{jour}</span>
                          <span className="text-[var(--primary)] font-medium">
                            {selectedCommande.repas[jour]?.mainDish}
                          </span>
                        </div>
                        {selectedCommande.repas[jour]?.ingredients && selectedCommande.repas[jour].ingredients.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Avec : {selectedCommande.repas[jour].ingredients.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paiement */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Paiement</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode :</span>
                      <span className="font-medium">
                        {selectedCommande.mode_paiement === 'daily' ? 'Par jour' : 'Hebdomadaire'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut :</span>
                      <span className={`font-medium ${selectedCommande.statut_paiement === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedCommande.statut_paiement === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total :</span>
                      <span className="text-[var(--primary)]">{selectedCommande.montant_total.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Changer le statut */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3">Changer le statut</h3>
                  <div className="flex flex-wrap gap-2">
                    {statutOptions.map((statut) => (
                      <button
                        key={statut}
                        onClick={() => handleUpdateStatus(selectedCommande.id, statut)}
                        disabled={isUpdating || selectedCommande.statut === statut}
                        className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-medium transition-all ${
                          selectedCommande.statut === statut
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                        } disabled:opacity-50`}
                      >
                        {getStatutLabel(statut)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={() => setSelectedCommande(null)}
                  className="w-full px-6 py-3 bg-gray-200 cursor-pointer text-foreground rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Fermer
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
      </div>
    </DashboardLayout>
  );
}
