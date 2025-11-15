'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Spinner from '@/components/Spinner';
import NotificationModal from '@/components/NotificationModal';
import { supabase, type Repas, type Pack } from '@/lib/supabase';

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<'repas' | 'packs'>('repas');
  const [repas, setRepas] = useState<Repas[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Repas | null>(null);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [showAddPackModal, setShowAddPackModal] = useState(false);

  // Formulaire repas
  const [repasForm, setRepasForm] = useState({
    name: '',
    selectedPackIds: [] as string[],
    disponible: true,
  });

  // Formulaire pack
  const [packForm, setPackForm] = useState({
    name: '',
    price: '',
    description: '',
    ordre: '',
    disponible: true,
  });

  const [isSaving, setIsSaving] = useState(false);

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

  // Modal de confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    type: 'repas' | 'pack';
  }>({
    isOpen: false,
    id: '',
    type: 'repas',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Récupérer les packs (tous les packs pour les admins grâce aux RLS policies)
      const { data: packsData, error: packsError } = await supabase
        .from('pack')
        .select('*')
        .order('ordre', { ascending: true });

        console.log(packsData)

      if (packsError) {
        console.error('Erreur packs:', packsError);
        setError('Erreur lors du chargement des packs');
        return;
      }

      setPacks(packsData || []);

      // Récupérer les repas
      const { data: repasData, error: repasError } = await supabase
        .from('repas')
        .select('*')
        .order('name', { ascending: true });

      if (repasError) {
        console.error('Erreur repas:', repasError);
        setError('Erreur lors du chargement des repas');
        return;
      }

      setRepas(repasData || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRepas = async () => {
    if (!repasForm.name) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Champs manquants',
        message: 'Veuillez remplir le nom du repas'
      });
      return;
    }

    if (repasForm.selectedPackIds.length === 0) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Packs requis',
        message: 'Veuillez sélectionner au moins un pack'
      });
      return;
    }

    // Calculer les prix à partir des packs sélectionnés
    const prices = repasForm.selectedPackIds
      .map(packId => packs.find(p => p.id === packId)?.price)
      .filter((price): price is number => price !== undefined)
      .sort((a, b) => a - b);

    setIsSaving(true);
    try {
      if (editingItem) {
        // Mode édition
        const { error: updateError } = await supabase
          .from('repas')
          .update({
            name: repasForm.name,
            prices: prices,
            pack_ids: repasForm.selectedPackIds,
            disponible: repasForm.disponible,
          })
          .eq('id', editingItem.id);

        if (updateError) {
          console.error('Erreur:', updateError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la mise à jour du repas'
          });
          return;
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Succès',
          message: 'Repas mis à jour avec succès'
        });
      } else {
        // Mode ajout
        const { error: insertError } = await supabase
          .from('repas')
          .insert([{
            name: repasForm.name,
            prices: prices,
            pack_ids: repasForm.selectedPackIds,
            disponible: repasForm.disponible,
          }]);

        if (insertError) {
          console.error('Erreur:', insertError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'ajout du repas'
          });
          return;
        }

        // Enregistrer le log de création
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.rpc('create_log', {
            p_user_id: session.user.id,
            p_action: 'create',
            p_entity_type: 'meal',
            p_entity_id: null,
            p_description: `Création d'un nouveau repas: ${repasForm.name}`,
            p_metadata: {
              name: repasForm.name,
              prices: prices
            },
            p_status: 'success'
          });
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Succès',
          message: 'Repas ajouté avec succès'
        });
      }

      // Réinitialiser le formulaire
      setRepasForm({
        name: '',
        selectedPackIds: [],
        disponible: true,
      });

      setShowAddModal(false);
      setEditingItem(null);
      fetchData();

    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDisponibilite = async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('repas')
        .update({ disponible: !currentStatus })
        .eq('id', id);

      if (updateError) {
        console.error('Erreur:', updateError);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la mise à jour'
        });
        return;
      }

      fetchData();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: 'Disponibilité mise à jour'
      });
    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      });
    }
  };

  const openDeleteConfirm = (id: string, type: 'repas' | 'pack' = 'repas') => {
    setDeleteConfirm({ isOpen: true, id, type });
  };

  const handleDelete = async () => {
    const { id, type } = deleteConfirm;
    
    // Récupérer l'élément avant suppression
    const itemToDelete = type === 'repas' 
      ? repas.find(r => r.id === id)
      : packs.find(p => p.id === id);
    
    setDeleteConfirm({ isOpen: false, id: '', type: 'repas' });

    try {
      const { error: deleteError } = await supabase
        .from(type === 'repas' ? 'repas' : 'pack')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Erreur:', deleteError);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la suppression'
        });
        return;
      }

      // Enregistrer le log de suppression
      const { data: { session } } = await supabase.auth.getSession();
      if (session && itemToDelete) {
        await supabase.rpc('create_log', {
          p_user_id: session.user.id,
          p_action: 'delete',
          p_entity_type: type === 'repas' ? 'meal' : 'meal',
          p_entity_id: id,
          p_description: `Suppression ${type === 'repas' ? 'du repas' : 'du pack'}: ${itemToDelete.name}`,
          p_metadata: {
            name: itemToDelete.name,
            type: type
          },
          p_status: 'success'
        });
      }

      fetchData();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: `${type === 'repas' ? 'Repas' : 'Pack'} supprimé avec succès`
      });
    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setRepasForm({
      name: '',
      selectedPackIds: [],
      disponible: true,
    });
    setShowAddModal(true);
  };

  const openEditModal = (item: Repas) => {
    setEditingItem(item);
    setRepasForm({
      name: item.name,
      selectedPackIds: item.pack_ids || [],
      disponible: item.disponible,
    });
    setShowAddModal(true);
  };

  // ========== GESTION DES PACKS ==========

  const handleAddPack = async () => {
    if (!packForm.name || !packForm.price) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Champs manquants',
        message: 'Veuillez remplir le nom et le prix'
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingPack) {
        // Mode édition
        const { error: updateError } = await supabase
          .from('pack')
          .update({
            name: packForm.name,
            price: parseInt(packForm.price),
            description: packForm.description || null,
            ordre: packForm.ordre ? parseInt(packForm.ordre) : 0,
            disponible: packForm.disponible,
          })
          .eq('id', editingPack.id);

        if (updateError) {
          console.error('Erreur:', updateError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la mise à jour du pack'
          });
          return;
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Succès',
          message: 'Pack mis à jour avec succès'
        });
      } else {
        // Mode ajout
        const { error: insertError } = await supabase
          .from('pack')
          .insert([{
            name: packForm.name,
            price: parseInt(packForm.price),
            description: packForm.description || null,
            ordre: packForm.ordre ? parseInt(packForm.ordre) : packs.length + 1,
            disponible: packForm.disponible,
          }]);

        if (insertError) {
          console.error('Erreur:', insertError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'ajout du pack'
          });
          return;
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Succès',
          message: 'Pack ajouté avec succès'
        });
      }

      // Réinitialiser le formulaire
      setPackForm({
        name: '',
        price: '',
        description: '',
        ordre: '',
        disponible: true,
      });

      setShowAddPackModal(false);
      setEditingPack(null);
      fetchData();

    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePackDisponibilite = async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('pack')
        .update({ disponible: !currentStatus })
        .eq('id', id);

      if (updateError) {
        console.error('Erreur:', updateError);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la mise à jour'
        });
        return;
      }

      fetchData();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: 'Disponibilité mise à jour'
      });
    } catch (err) {
      console.error('Erreur:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      });
    }
  };

  const openAddPackModal = () => {
    setEditingPack(null);
    setPackForm({
      name: '',
      price: '',
      description: '',
      ordre: '',
      disponible: true,
    });
    setShowAddPackModal(true);
  };

  const openEditPackModal = (pack: Pack) => {
    setEditingPack(pack);
    setPackForm({
      name: pack.name,
      price: pack.price.toString(),
      description: pack.description || '',
      ordre: pack.ordre.toString(),
      disponible: pack.disponible,
    });
    setShowAddPackModal(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des repas</h1>
              <p className="text-gray-600">Gérez les plats et les packs de prix</p>
            </div>
            <button
              onClick={activeTab === 'repas' ? openAddModal : openAddPackModal}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'repas' ? 'Ajouter un repas' : 'Ajouter un pack'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('repas')}
                className={`px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === 'repas'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Repas ({repas.length})
              </button>
              <button
                onClick={() => setActiveTab('packs')}
                className={`px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === 'packs'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Packs de prix ({packs.length})
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              {activeTab === 'repas' ? 'Total des repas' : 'Total des packs'}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {activeTab === 'repas' ? repas.length : packs.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Disponibles</p>
            <p className="text-2xl font-bold text-green-600">
              {activeTab === 'repas' 
                ? repas.filter(r => r.disponible).length
                : packs.filter(p => p.disponible).length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Indisponibles</p>
            <p className="text-2xl font-bold text-gray-600">
              {activeTab === 'repas'
                ? repas.filter(r => !r.disponible).length
                : packs.filter(p => !p.disponible).length
              }
            </p>
          </div>
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
          </div>
        ) : (
          <>
            {/* Liste des repas */}
            {activeTab === 'repas' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {repas.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-gray-500 mb-2">Aucun repas pour le moment</p>
                    <p className="text-sm text-gray-400">Cliquez sur "Ajouter un repas" pour commencer</p>
                  </div>
                ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {repas.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-2">
                            {item.prices.map((price, idx) => (
                              <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {price.toLocaleString()} FCFA
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleDisponibilite(item.id, item.disponible)}
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full cursor-pointer ${
                              item.disponible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.disponible ? 'Disponible' : 'Indisponible'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => openEditModal(item)}
                              className="text-[var(--primary)] hover:underline text-sm font-medium cursor-pointer"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                )}
              </div>
            )}

            {/* Liste des packs */}
            {activeTab === 'packs' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {packs.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-gray-500 mb-2">Aucun pack pour le moment</p>
                    <p className="text-sm text-gray-400">Cliquez sur "Ajouter un pack" pour commencer</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Prix</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ordre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {packs.map((pack) => (
                          <tr key={pack.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {pack.name}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-[var(--primary)]">
                              {pack.price.toLocaleString()} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {pack.description || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {pack.ordre}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleTogglePackDisponibilite(pack.id, pack.disponible)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full cursor-pointer ${
                                  pack.disponible
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {pack.disponible ? 'Disponible' : 'Indisponible'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => openEditPackModal(pack)}
                                  className="text-[var(--primary)] hover:underline text-sm font-medium cursor-pointer"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(pack.id, 'pack')}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal d'ajout/édition */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingItem ? 'Modifier le repas' : 'Ajouter un repas'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du repas *
                  </label>
                  <input
                    type="text"
                    value={repasForm.name}
                    onChange={(e) => setRepasForm({ ...repasForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Ex: Riz sauce poisson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner les packs de prix *
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                    {packs.length === 0 ? (
                      <div className="text-center">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium text-yellow-800 mb-2">
                            Aucun pack disponible
                          </h4>
                          <p className="text-sm text-yellow-700 mb-4">
                            Il faut d'abord créer des packs de prix avant de pouvoir créer un repas.
                          </p>
                          <button
                            onClick={() => {
                              setShowAddModal(false);
                              setEditingItem(null);
                              // Basculer vers l'onglet packs
                              setActiveTab('packs');
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium cursor-pointer"
                          >
                            Aller à la gestion des packs
                          </button>
                        </div>
                      </div>
                    ) : (
                      packs.map((pack) => (
                        <label
                          key={pack.id}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={repasForm.selectedPackIds.includes(pack.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRepasForm({
                                  ...repasForm,
                                  selectedPackIds: [...repasForm.selectedPackIds, pack.id]
                                });
                              } else {
                                setRepasForm({
                                  ...repasForm,
                                  selectedPackIds: repasForm.selectedPackIds.filter(id => id !== pack.id)
                                });
                              }
                            }}
                            className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)] mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{pack.name}</span>
                              <span className="text-sm font-bold text-[var(--primary)]">{pack.price.toLocaleString()} FCFA</span>
                            </div>
                            {pack.description && (
                              <p className="text-xs text-gray-500 mt-1">{pack.description}</p>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {repasForm.selectedPackIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {repasForm.selectedPackIds.length} pack(s) sélectionné(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="disponible-repas"
                    checked={repasForm.disponible}
                    onChange={(e) => setRepasForm({ ...repasForm, disponible: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="disponible-repas" className="text-sm text-gray-700">
                    Disponible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddRepas}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving && <Spinner size="sm" />}
                    {isSaving ? (editingItem ? 'Modification...' : 'Ajout...') : (editingItem ? 'Modifier' : 'Ajouter')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'ajout/édition de pack */}
        {showAddPackModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingPack ? 'Modifier le pack' : 'Ajouter un pack'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddPackModal(false);
                    setEditingPack(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du pack *
                  </label>
                  <input
                    type="text"
                    value={packForm.name}
                    onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Ex: Pack Standard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={packForm.price}
                    onChange={(e) => setPackForm({ ...packForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={packForm.description}
                    onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    rows={3}
                    placeholder="Description du pack..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={packForm.ordre}
                    onChange={(e) => setPackForm({ ...packForm, ordre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Plus le nombre est petit, plus le pack apparaît en premier</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="disponible-pack"
                    checked={packForm.disponible}
                    onChange={(e) => setPackForm({ ...packForm, disponible: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="disponible-pack" className="text-sm text-gray-700">
                    Disponible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddPackModal(false);
                      setEditingPack(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddPack}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving && <Spinner size="sm" />}
                    {isSaving ? (editingPack ? 'Modification...' : 'Ajout...') : (editingPack ? 'Modifier' : 'Ajouter')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce {deleteConfirm.type === 'repas' ? 'repas' : 'pack'} ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, id: '', type: 'repas' })}
                  className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all cursor-pointer"
                >
                  Supprimer
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
