'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Spinner from '@/components/Spinner';
import { supabase, type Repas, type Accompagnement } from '@/lib/supabase';

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<'repas' | 'accompagnements'>('repas');
  const [repas, setRepas] = useState<Repas[]>([]);
  const [accompagnements, setAccompagnements] = useState<Accompagnement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Repas | Accompagnement | null>(null);

  // Formulaire repas
  const [repasForm, setRepasForm] = useState({
    nom: '',
    description: '',
    prix: '',
    image_url: '',
    disponible: true,
    accompagnements_disponibles: [] as string[],
  });

  // Formulaire accompagnement
  const [accompagnementForm, setAccompagnementForm] = useState({
    nom: '',
    description: '',
    disponible: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Récupérer les repas
      const { data: repasData, error: repasError } = await supabase
        .from('repas')
        .select('*')
        .order('nom', { ascending: true });

      if (repasError) {
        console.error('Erreur repas:', repasError);
        setError('Erreur lors du chargement des repas');
        return;
      }

      // Récupérer les accompagnements
      const { data: accompagnementsData, error: accompagnementsError } = await supabase
        .from('accompagnements')
        .select('*')
        .order('nom', { ascending: true });

      if (accompagnementsError) {
        console.error('Erreur accompagnements:', accompagnementsError);
        setError('Erreur lors du chargement des accompagnements');
        return;
      }

      setRepas(repasData || []);
      setAccompagnements(accompagnementsData || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRepas = async () => {
    if (!repasForm.nom || !repasForm.prix) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (repasForm.accompagnements_disponibles.length === 0) {
      alert('Veuillez sélectionner au moins un accompagnement');
      return;
    }

    setIsSaving(true);
    try {
      const { error: insertError } = await supabase
        .from('repas')
        .insert([{
          nom: repasForm.nom,
          description: repasForm.description || null,
          prix: parseInt(repasForm.prix),
          image_url: repasForm.image_url || null,
          accompagnements_disponibles: repasForm.accompagnements_disponibles,
          disponible: repasForm.disponible,
        }]);

      if (insertError) {
        console.error('Erreur:', insertError);
        alert('Erreur lors de l\'ajout du repas');
        return;
      }

      // Réinitialiser le formulaire
      setRepasForm({
        nom: '',
        description: '',
        prix: '',
        image_url: '',
        disponible: true,
        accompagnements_disponibles: [],
      });

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAccompagnement = async () => {
    if (!accompagnementForm.nom) {
      alert('Veuillez entrer un nom');
      return;
    }

    setIsSaving(true);
    try {
      const { error: insertError } = await supabase
        .from('accompagnements')
        .insert([{
          nom: accompagnementForm.nom,
          description: accompagnementForm.description || null,
          disponible: accompagnementForm.disponible,
        }]);

      if (insertError) {
        console.error('Erreur:', insertError);
        alert('Erreur lors de l\'ajout de l\'accompagnement');
        return;
      }

      // Réinitialiser le formulaire
      setAccompagnementForm({
        nom: '',
        description: '',
        disponible: true,
      });

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDisponibilite = async (id: string, type: 'repas' | 'accompagnements', currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from(type)
        .update({ disponible: !currentStatus })
        .eq('id', id);

      if (updateError) {
        console.error('Erreur:', updateError);
        alert('Erreur lors de la mise à jour');
        return;
      }

      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string, type: 'repas' | 'accompagnements') => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from(type)
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Erreur:', deleteError);
        alert('Erreur lors de la suppression');
        return;
      }

      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Une erreur est survenue');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setRepasForm({
      nom: '',
      description: '',
      prix: '',
      image_url: '',
      disponible: true,
      accompagnements_disponibles: [],
    });
    setAccompagnementForm({
      nom: '',
      description: '',
      disponible: true,
    });
    setShowAddModal(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des repas</h1>
              <p className="text-gray-600">Gérez les plats et accompagnements disponibles</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
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
                Plats principaux ({repas.length})
              </button>
              <button
                onClick={() => setActiveTab('accompagnements')}
                className={`px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === 'accompagnements'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Accompagnements ({accompagnements.length})
              </button>
            </div>
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
                    <p className="text-sm text-gray-400">Cliquez sur "Ajouter" pour créer un repas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
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
                              {item.nom}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.description || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {item.prix.toLocaleString()} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.accompagnements_disponibles && item.accompagnements_disponibles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {item.accompagnements_disponibles.slice(0, 3).map((acc, idx) => (
                                    <span key={idx} className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                      {acc}
                                    </span>
                                  ))}
                                  {item.accompagnements_disponibles.length > 3 && (
                                    <span className="text-xs text-gray-500">+{item.accompagnements_disponibles.length - 3}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">Aucun</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleDisponibilite(item.id, 'repas', item.disponible)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                  item.disponible
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.disponible ? 'Disponible' : 'Indisponible'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(item.id, 'repas')}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Supprimer
                              </button>
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
                    <p className="text-sm text-gray-400">Cliquez sur "Ajouter" pour créer un accompagnement</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accompagnements.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {item.nom}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.description || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleDisponibilite(item.id, 'accompagnements', item.disponible)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                  item.disponible
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.disponible ? 'Disponible' : 'Indisponible'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(item.id, 'accompagnements')}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Supprimer
                              </button>
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

        {/* Modal d'ajout */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {activeTab === 'repas' ? 'Ajouter un plat' : 'Ajouter un accompagnement'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeTab === 'repas' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du plat *
                    </label>
                    <input
                      type="text"
                      value={repasForm.nom}
                      onChange={(e) => setRepasForm({ ...repasForm, nom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="Ex: Riz sauce"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={repasForm.description}
                      onChange={(e) => setRepasForm({ ...repasForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      rows={3}
                      placeholder="Description du plat..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={repasForm.prix}
                      onChange={(e) => setRepasForm({ ...repasForm, prix: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de l'image
                    </label>
                    <input
                      type="text"
                      value={repasForm.image_url}
                      onChange={(e) => setRepasForm({ ...repasForm, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accompagnements disponibles *
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {accompagnements.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucun accompagnement disponible. Créez-en d'abord dans l'onglet Accompagnements.</p>
                      ) : (
                        <div className="space-y-2">
                          {accompagnements.map((acc) => (
                            <label key={acc.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={repasForm.accompagnements_disponibles.includes(acc.nom)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRepasForm({
                                      ...repasForm,
                                      accompagnements_disponibles: [...repasForm.accompagnements_disponibles, acc.nom]
                                    });
                                  } else {
                                    setRepasForm({
                                      ...repasForm,
                                      accompagnements_disponibles: repasForm.accompagnements_disponibles.filter(n => n !== acc.nom)
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                              />
                              <span className="text-sm text-gray-700">{acc.nom}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {repasForm.accompagnements_disponibles.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {repasForm.accompagnements_disponibles.length} accompagnement(s) sélectionné(s)
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
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddRepas}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving && <Spinner size="sm" />}
                      {isSaving ? 'Ajout...' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'accompagnement *
                    </label>
                    <input
                      type="text"
                      value={accompagnementForm.nom}
                      onChange={(e) => setAccompagnementForm({ ...accompagnementForm, nom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="Ex: Poisson"
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
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddAccompagnement}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving && <Spinner size="sm" />}
                      {isSaving ? 'Ajout...' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
