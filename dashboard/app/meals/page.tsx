'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Spinner from '@/components/Spinner';
import NotificationModal from '@/components/NotificationModal';
import { supabase, type Repas, type Accompagnement, type RepasAvecAccompagnements } from '@/lib/supabase';

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<'repas' | 'accompagnements'>('repas');
  const [repas, setRepas] = useState<RepasAvecAccompagnements[]>([]);
  const [accompagnements, setAccompagnements] = useState<Accompagnement[]>([]);
  const [repasAccompagnements, setRepasAccompagnements] = useState<{ [repasId: string]: string[] }>({});
  const [selectedAccompagnements, setSelectedAccompagnements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RepasAvecAccompagnements | null>(null);
  const [editingAccompagnement, setEditingAccompagnement] = useState<Accompagnement | null>(null);
  const [showAddAccompagnementModal, setShowAddAccompagnementModal] = useState(false);

  // Formulaire repas
  const [repasForm, setRepasForm] = useState({
    name: '',
    prices: '' as string, // Prix séparés par des virgules
    disponible: true,
  });

  // Formulaire accompagnement
  const [accompagnementForm, setAccompagnementForm] = useState({
    name: '',
    price: '',
    description: '',
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
    type: 'repas' | 'accompagnement';
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

      // Récupérer les accompagnements
      const { data: accompagnementsData, error: accompagnementsError } = await supabase
        .from('accompagnements')
        .select('*')
        .order('name', { ascending: true });

      if (accompagnementsError) {
        console.error('Erreur accompagnements:', accompagnementsError);
        setError('Erreur lors du chargement des accompagnements');
        return;
      }

      setAccompagnements(accompagnementsData || []);

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

      // Récupérer les associations repas-accompagnements
      const { data: associationsData, error: associationsError } = await supabase
        .from('repas_accompagnements')
        .select('repas_id, accompagnement_id');

      if (associationsError) {
        console.error('Erreur associations:', associationsError);
      }

      // Créer un mapping des associations
      const associationsMap: { [repasId: string]: string[] } = {};
      (associationsData || []).forEach((assoc) => {
        if (!associationsMap[assoc.repas_id]) {
          associationsMap[assoc.repas_id] = [];
        }
        associationsMap[assoc.repas_id].push(assoc.accompagnement_id);
      });

      setRepasAccompagnements(associationsMap);

      // Enrichir les repas avec leurs accompagnements
      const repasAvecAccompagnements: RepasAvecAccompagnements[] = (repasData || []).map((r) => ({
        ...r,
        accompagnements: (associationsMap[r.id] || [])
          .map((accId) => accompagnementsData?.find((a) => a.id === accId))
          .filter((a): a is Accompagnement => a !== undefined),
      }));

      setRepas(repasAvecAccompagnements);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRepas = async () => {
    if (!repasForm.name || !repasForm.prices) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Champs manquants',
        message: 'Veuillez remplir le nom et les prix du repas'
      });
      return;
    }

    // Parser les prix (séparés par des virgules)
    const pricesArray = repasForm.prices
      .split(',')
      .map(p => parseInt(p.trim()))
      .filter(p => !isNaN(p) && p > 0)
      .sort((a, b) => a - b);

    if (pricesArray.length === 0) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Prix invalides',
        message: 'Veuillez entrer des prix valides séparés par des virgules'
      });
      return;
    }

    setIsSaving(true);
    try {
      let repasId: string;

      if (editingItem) {
        // Mode édition
        repasId = editingItem.id;

        const { error: updateError } = await supabase
          .from('repas')
          .update({
            name: repasForm.name,
            prices: pricesArray,
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

        // Supprimer les anciennes associations
        await supabase
          .from('repas_accompagnements')
          .delete()
          .eq('repas_id', repasId);

      } else {
        // Mode ajout
        const { data: insertData, error: insertError } = await supabase
          .from('repas')
          .insert([{
            name: repasForm.name,
            prices: pricesArray,
            disponible: repasForm.disponible,
          }])
          .select()
          .single();

        if (insertError || !insertData) {
          console.error('Erreur:', insertError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'ajout du repas'
          });
          return;
        }

        repasId = insertData.id;

        // Enregistrer le log de création
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.rpc('create_log', {
            p_user_id: session.user.id,
            p_action: 'create',
            p_entity_type: 'meal',
            p_entity_id: repasId,
            p_description: `Création d'un nouveau repas: ${repasForm.name}`,
            p_metadata: {
              name: repasForm.name,
              prices: pricesArray
            },
            p_status: 'success'
          });
        }
      }

      // Sauvegarder les nouvelles associations d'accompagnements
      if (selectedAccompagnements.length > 0) {
        const associations = selectedAccompagnements.map(accompagnementId => ({
          repas_id: repasId,
          accompagnement_id: accompagnementId,
        }));

        const { error: assocError } = await supabase
          .from('repas_accompagnements')
          .insert(associations);

        if (assocError) {
          console.error('Erreur associations:', assocError);
          // Ne pas bloquer si erreur d'association
        }
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: editingItem ? 'Repas mis à jour avec succès' : 'Repas ajouté avec succès'
      });

      // Réinitialiser le formulaire
      setRepasForm({
        name: '',
        prices: '',
        disponible: true,
      });
      setSelectedAccompagnements([]);

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

  const handleAddAccompagnement = async () => {
    if (!accompagnementForm.name || !accompagnementForm.price) {
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
      if (editingAccompagnement) {
        // Mode édition
        const { error: updateError } = await supabase
          .from('accompagnements')
          .update({
            name: accompagnementForm.name,
            price: parseInt(accompagnementForm.price),
            description: accompagnementForm.description || null,
            disponible: accompagnementForm.disponible,
          })
          .eq('id', editingAccompagnement.id);

        if (updateError) {
          console.error('Erreur:', updateError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la mise à jour de l\'accompagnement'
          });
          return;
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Succès',
          message: 'Accompagnement mis à jour avec succès'
        });
      } else {
        // Mode ajout
        const { error: insertError } = await supabase
          .from('accompagnements')
          .insert([{
            name: accompagnementForm.name,
            price: parseInt(accompagnementForm.price),
            description: accompagnementForm.description || null,
            disponible: accompagnementForm.disponible,
          }]);

        if (insertError) {
          console.error('Erreur:', insertError);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'ajout de l\'accompagnement'
          });
          return;
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Succès',
          message: 'Accompagnement ajouté avec succès'
        });
      }

      // Réinitialiser le formulaire
      setAccompagnementForm({
        name: '',
        price: '',
        description: '',
        disponible: true,
      });

      setShowAddAccompagnementModal(false);
      setEditingAccompagnement(null);
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

  const handleToggleDisponibiliteRepas = async (id: string, currentStatus: boolean) => {
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

  const handleToggleDisponibiliteAccompagnement = async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('accompagnements')
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

  const openDeleteConfirm = (id: string, type: 'repas' | 'accompagnement' = 'repas') => {
    setDeleteConfirm({ isOpen: true, id, type });
  };

  const handleDelete = async () => {
    const { id, type } = deleteConfirm;

    // Récupérer l'élément avant suppression
    const itemToDelete = type === 'repas'
      ? repas.find(r => r.id === id)
      : accompagnements.find(a => a.id === id);

    setDeleteConfirm({ isOpen: false, id: '', type: 'repas' });

    try {
      const { error: deleteError } = await supabase
        .from(type === 'repas' ? 'repas' : 'accompagnements')
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
          p_entity_type: 'meal',
          p_entity_id: id,
          p_description: `Suppression ${type === 'repas' ? 'du repas' : 'de l\'accompagnement'}: ${itemToDelete.name}`,
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
        message: `${type === 'repas' ? 'Repas' : 'Accompagnement'} supprimé avec succès`
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
    setSelectedAccompagnements([]);
    setRepasForm({
      name: '',
      prices: '',
      disponible: true,
    });
    setShowAddModal(true);
  };

  const openEditModal = (item: RepasAvecAccompagnements) => {
    setEditingItem(item);
    setSelectedAccompagnements(item.accompagnements.map(a => a.id));
    setRepasForm({
      name: item.name,
      prices: item.prices.join(', '),
      disponible: item.disponible,
    });
    setShowAddModal(true);
  };

  const openAddAccompagnementModal = () => {
    setEditingAccompagnement(null);
    setAccompagnementForm({
      name: '',
      price: '',
      description: '',
      disponible: true,
    });
    setShowAddAccompagnementModal(true);
  };

  const openEditAccompagnementModal = (accompagnement: Accompagnement) => {
    setEditingAccompagnement(accompagnement);
    setAccompagnementForm({
      name: accompagnement.name,
      price: accompagnement.price.toString(),
      description: accompagnement.description || '',
      disponible: accompagnement.disponible,
    });
    setShowAddAccompagnementModal(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des repas</h1>
              <p className="text-gray-600">Gérez les plats et les accompagnements</p>
            </div>
            <button
              onClick={activeTab === 'repas' ? openAddModal : openAddAccompagnementModal}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'repas' ? 'Ajouter un repas' : 'Ajouter un accompagnement'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('repas')}
                className={`px-4 py-3 font-medium transition-all border-b-2 ${activeTab === 'repas'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Repas ({repas.length})
              </button>
              <button
                onClick={() => setActiveTab('accompagnements')}
                className={`px-4 py-3 font-medium transition-all border-b-2 ${activeTab === 'accompagnements'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Accompagnements ({accompagnements.length})
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              {activeTab === 'repas' ? 'Total des repas' : 'Total des accompagnements'}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {activeTab === 'repas' ? repas.length : accompagnements.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Disponibles</p>
            <p className="text-2xl font-bold text-green-600">
              {activeTab === 'repas'
                ? repas.filter(r => r.disponible).length
                : accompagnements.filter(a => a.disponible).length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Indisponibles</p>
            <p className="text-2xl font-bold text-gray-600">
              {activeTab === 'repas'
                ? repas.filter(r => !r.disponible).length
                : accompagnements.filter(a => !a.disponible).length
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Accompagnements</th>
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
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.accompagnements.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {item.accompagnements.map((acc) => (
                                    <span key={acc.id} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                      {acc.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">Aucun</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleDisponibiliteRepas(item.id, item.disponible)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full cursor-pointer ${item.disponible
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

            {/* Liste des accompagnements */}
            {activeTab === 'accompagnements' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {accompagnements.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-gray-500 mb-2">Aucun accompagnement pour le moment</p>
                    <p className="text-sm text-gray-400">Cliquez sur "Ajouter un accompagnement" pour commencer</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Prix</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accompagnements.map((accompagnement) => (
                          <tr key={accompagnement.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {accompagnement.name}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-[var(--primary)]">
                              {accompagnement.price.toLocaleString()} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {accompagnement.description || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleDisponibiliteAccompagnement(accompagnement.id, accompagnement.disponible)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full cursor-pointer ${accompagnement.disponible
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}
                              >
                                {accompagnement.disponible ? 'Disponible' : 'Indisponible'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => openEditAccompagnementModal(accompagnement)}
                                  className="text-[var(--primary)] hover:underline text-sm font-medium cursor-pointer"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(accompagnement.id, 'accompagnement')}
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

        {/* Modal d'ajout/édition de repas */}
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
                    Prix (FCFA) *
                  </label>
                  <input
                    type="text"
                    value={repasForm.prices}
                    onChange={(e) => setRepasForm({ ...repasForm, prices: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Ex: 1000, 1500, 2000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Séparez les prix par des virgules</p>
                </div>

                {/* Sélection des accompagnements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accompagnements disponibles
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {accompagnements.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Aucun accompagnement disponible. Créez-en d'abord dans l'onglet "Accompagnements".
                      </p>
                    ) : (
                      accompagnements.map((acc) => (
                        <div key={acc.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`acc-${acc.id}`}
                            checked={selectedAccompagnements.includes(acc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccompagnements([...selectedAccompagnements, acc.id]);
                              } else {
                                setSelectedAccompagnements(selectedAccompagnements.filter(id => id !== acc.id));
                              }
                            }}
                            className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                          />
                          <label htmlFor={`acc-${acc.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            {acc.name} <span className="text-gray-500">({acc.price.toLocaleString()} FCFA)</span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sélectionnez les accompagnements qui peuvent être ajoutés à ce repas
                  </p>
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

        {/* Modal d'ajout/édition d'accompagnement */}
        {showAddAccompagnementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingAccompagnement ? 'Modifier l\'accompagnement' : 'Ajouter un accompagnement'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddAccompagnementModal(false);
                    setEditingAccompagnement(null);
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
                    Nom de l'accompagnement *
                  </label>
                  <input
                    type="text"
                    value={accompagnementForm.name}
                    onChange={(e) => setAccompagnementForm({ ...accompagnementForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Ex: Salade verte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={accompagnementForm.price}
                    onChange={(e) => setAccompagnementForm({ ...accompagnementForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={accompagnementForm.description}
                    onChange={(e) => setAccompagnementForm({ ...accompagnementForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    rows={3}
                    placeholder="Description de l'accompagnement..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="disponible-accompagnement"
                    checked={accompagnementForm.disponible}
                    onChange={(e) => setAccompagnementForm({ ...accompagnementForm, disponible: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="disponible-accompagnement" className="text-sm text-gray-700">
                    Disponible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddAccompagnementModal(false);
                      setEditingAccompagnement(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddAccompagnement}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving && <Spinner size="sm" />}
                    {isSaving ? (editingAccompagnement ? 'Modification...' : 'Ajout...') : (editingAccompagnement ? 'Modifier' : 'Ajouter')}
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
                Êtes-vous sûr de vouloir supprimer ce{deleteConfirm.type === 'repas' ? ' repas' : 't accompagnement'} ? Cette action est irréversible.
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
