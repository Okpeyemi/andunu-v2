'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Vendeur, type VendeurAvecRepas, type Repas, type CreateVendeurInput } from '@/lib/supabase';
import Spinner from '@/components/Spinner';
import DashboardLayout from '@/components/DashboardLayout';
import NotificationModal from '@/components/NotificationModal';

export default function VendeursPage() {
  const router = useRouter();
  const [vendeurs, setVendeurs] = useState<VendeurAvecRepas[]>([]);
  const [filteredVendeurs, setFilteredVendeurs] = useState<VendeurAvecRepas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif'>('all');
  
  // Modal d'ajout
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newVendeur, setNewVendeur] = useState<CreateVendeurInput>({
    nom_complet: '',
    telephone: '',
    email: '',
    adresse: '',
    actif: true
  });
  
  // Modal de gestion des repas
  const [selectedVendeur, setSelectedVendeur] = useState<VendeurAvecRepas | null>(null);
  const [isRepasModalOpen, setIsRepasModalOpen] = useState(false);
  const [availableRepas, setAvailableRepas] = useState<Repas[]>([]);
  const [selectedRepasIds, setSelectedRepasIds] = useState<string[]>([]);
  const [isUpdatingRepas, setIsUpdatingRepas] = useState(false);
  
  // Modal de notification
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
    fetchVendeurs();
    fetchAvailableRepas();
  }, []);

  useEffect(() => {
    filterVendeurs();
  }, [vendeurs, searchTerm, statusFilter]);

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

  const fetchVendeurs = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Récupérer les vendeurs avec leurs repas
      const { data: vendeursData, error: vendeursError } = await supabase
        .from('vendeurs')
        .select(`
          *,
          vendeur_repas (
            repas_id,
            prix_vendeur,
            repas (
              id,
              name,
              prices
            )
          )
        `)
        .order('nom_complet');

      if (vendeursError) throw vendeursError;

      // Transformer les données pour correspondre au type VendeurAvecRepas
      const vendeursAvecRepas: VendeurAvecRepas[] = (vendeursData || []).map(vendeur => ({
        ...vendeur,
        repas: (vendeur.vendeur_repas || []).map((vr: any) => ({
          id: vr.repas.id,
          name: vr.repas.name,
          prices: vr.repas.prices,
          prix_vendeur: vr.prix_vendeur
        }))
      }));

      setVendeurs(vendeursAvecRepas);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors du chargement des vendeurs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRepas = async () => {
    try {
      const { data: repasData, error: repasError } = await supabase
        .from('repas')
        .select('*')
        .eq('disponible', true)
        .order('name');

      if (repasError) throw repasError;
      setAvailableRepas(repasData || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des repas:', err);
    }
  };

  const filterVendeurs = () => {
    let filtered = [...vendeurs];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vendeur =>
        vendeur.nom_complet.toLowerCase().includes(term) ||
        vendeur.telephone?.toLowerCase().includes(term) ||
        vendeur.email?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendeur => 
        statusFilter === 'actif' ? vendeur.actif : !vendeur.actif
      );
    }

    setFilteredVendeurs(filtered);
  };

  const createVendeur = async () => {
    try {
      setIsCreating(true);
      setCreateError('');

      // Validation
      if (!newVendeur.nom_complet.trim()) {
        setCreateError('Le nom complet est obligatoire');
        return;
      }

      if (newVendeur.email && !newVendeur.email.includes('@')) {
        setCreateError('Email invalide');
        return;
      }

      const { error } = await supabase
        .from('vendeurs')
        .insert([newVendeur]);

      if (error) throw error;

      // Recharger la liste
      await fetchVendeurs();

      // Fermer le modal et réinitialiser
      setIsCreateModalOpen(false);
      setNewVendeur({
        nom_complet: '',
        telephone: '',
        email: '',
        adresse: '',
        actif: true
      });

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Vendeur créé',
        message: 'Le vendeur a été créé avec succès !'
      });
    } catch (err: any) {
      console.error('Erreur:', err);
      setCreateError(err.message || 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleVendeurStatus = async (vendeurId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vendeurs')
        .update({ actif: newStatus })
        .eq('id', vendeurId);

      if (error) throw error;

      // Mettre à jour localement
      setVendeurs(vendeurs.map(vendeur =>
        vendeur.id === vendeurId ? { ...vendeur, actif: newStatus } : vendeur
      ));

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Statut mis à jour',
        message: `Le vendeur a été ${newStatus ? 'activé' : 'désactivé'} avec succès.`
      });
    } catch (err: any) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue lors de la mise à jour.'
      });
    }
  };

  const openRepasModal = (vendeur: VendeurAvecRepas) => {
    setSelectedVendeur(vendeur);
    setSelectedRepasIds(vendeur.repas.map(r => r.id));
    setIsRepasModalOpen(true);
  };

  const updateVendeurRepas = async () => {
    if (!selectedVendeur) return;

    try {
      setIsUpdatingRepas(true);

      // Supprimer toutes les associations existantes
      await supabase
        .from('vendeur_repas')
        .delete()
        .eq('vendeur_id', selectedVendeur.id);

      // Ajouter les nouvelles associations
      if (selectedRepasIds.length > 0) {
        const insertData = selectedRepasIds.map(repasId => ({
          vendeur_id: selectedVendeur.id,
          repas_id: repasId
        }));

        const { error } = await supabase
          .from('vendeur_repas')
          .insert(insertData);

        if (error) throw error;
      }

      // Recharger les données
      await fetchVendeurs();
      setIsRepasModalOpen(false);
      setSelectedVendeur(null);

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Repas mis à jour',
        message: 'Les repas du vendeur ont été mis à jour avec succès.'
      });
    } catch (err: any) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue lors de la mise à jour.'
      });
    } finally {
      setIsUpdatingRepas(false);
    }
  };

  const getStatusBadge = (actif: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {actif ? 'Actif' : 'Inactif'}
      </span>
    );
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des vendeurs</h1>
              <p className="text-gray-600 mt-1">
                {filteredVendeurs.length} vendeur{filteredVendeurs.length > 1 ? 's' : ''} trouvé{filteredVendeurs.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] cursor-pointer text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un vendeur
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, téléphone, email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'actif' | 'inactif')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table des vendeurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repas vendus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendeurs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun vendeur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredVendeurs.map((vendeur) => (
                    <tr key={vendeur.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {vendeur.nom_complet.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vendeur.nom_complet}</div>
                            {vendeur.adresse && (
                              <div className="text-sm text-gray-500">{vendeur.adresse}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vendeur.telephone && (
                          <div className="text-sm text-gray-900">{vendeur.telephone}</div>
                        )}
                        {vendeur.email && (
                          <div className="text-sm text-gray-500">{vendeur.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {vendeur.repas.length > 0 ? (
                            <div className="space-y-1">
                              {vendeur.repas.slice(0, 3).map((repas) => (
                                <div key={repas.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {repas.name}
                                </div>
                              ))}
                              {vendeur.repas.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{vendeur.repas.length - 3} autres
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Aucun repas</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vendeur.actif)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRepasModal(vendeur)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                          >
                            Gérer repas
                          </button>
                          <button
                            onClick={() => toggleVendeurStatus(vendeur.id, !vendeur.actif)}
                            className={`cursor-pointer transition-colors ${
                              vendeur.actif 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {vendeur.actif ? 'Désactiver' : 'Activer'}
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

      {/* Modal de création de vendeur */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Ajouter un vendeur
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={newVendeur.nom_complet}
                  onChange={(e) => setNewVendeur({ ...newVendeur, nom_complet: e.target.value })}
                  placeholder="Ex: Marie Kouassi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newVendeur.telephone}
                  onChange={(e) => setNewVendeur({ ...newVendeur, telephone: e.target.value })}
                  placeholder="+229 XX XX XX XX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newVendeur.email}
                  onChange={(e) => setNewVendeur({ ...newVendeur, email: e.target.value })}
                  placeholder="vendeur@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <textarea
                  value={newVendeur.adresse}
                  onChange={(e) => setNewVendeur({ ...newVendeur, adresse: e.target.value })}
                  placeholder="Adresse complète"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {createError}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={createVendeur}
                disabled={isCreating}
                className="w-full px-4 py-2.5 bg-[var(--primary)] cursor-pointer text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isCreating ? 'Création en cours...' : 'Créer le vendeur'}
              </button>

              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError('');
                  setNewVendeur({
                    nom_complet: '',
                    telephone: '',
                    email: '',
                    adresse: '',
                    actif: true
                  });
                }}
                disabled={isCreating}
                className="w-full px-4 py-2 bg-white border border-gray-300 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des repas */}
      {isRepasModalOpen && selectedVendeur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Gérer les repas de {selectedVendeur.nom_complet}
            </h3>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez les repas que ce vendeur propose :
              </p>
              
              {availableRepas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-yellow-800 mb-2">
                      Aucun repas disponible
                    </h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      Il faut d'abord ajouter des repas dans la section "Repas" avant de pouvoir les associer à ce vendeur.
                    </p>
                    <button
                      onClick={() => {
                        setIsRepasModalOpen(false);
                        setSelectedVendeur(null);
                        // Rediriger vers la page repas
                        window.location.href = '/meals';
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium cursor-pointer"
                    >
                      Aller à la gestion des repas
                    </button>
                  </div>
                </div>
              ) : (
                availableRepas.map((repas) => (
                  <label key={repas.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRepasIds.includes(repas.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRepasIds([...selectedRepasIds, repas.id]);
                        } else {
                          setSelectedRepasIds(selectedRepasIds.filter(id => id !== repas.id));
                        }
                      }}
                      className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{repas.name}</div>
                      <div className="text-sm text-gray-500">
                        Prix: {repas.prices.join(', ')} FCFA
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={updateVendeurRepas}
                disabled={isUpdatingRepas}
                className="w-full px-4 py-2.5 bg-[var(--primary)] cursor-pointer text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isUpdatingRepas ? 'Mise à jour...' : 'Mettre à jour les repas'}
              </button>

              <button
                onClick={() => {
                  setIsRepasModalOpen(false);
                  setSelectedVendeur(null);
                  setSelectedRepasIds([]);
                }}
                disabled={isUpdatingRepas}
                className="w-full px-4 py-2 bg-white border border-gray-300 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
