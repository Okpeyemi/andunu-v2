'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { supabase, type Commande } from '@/lib/supabase';

interface MealDetails {
  mainDish: string;
  ingredients: string[];
}

export default function SuiviCommandePage() {
  const router = useRouter();
  const [commandeId, setCommandeId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [commande, setCommande] = useState<Commande | null>(null);
  const [error, setError] = useState('');
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editedMenu, setEditedMenu] = useState<Record<string, MealDetails>>({});
  const [ingredientsText, setIngredientsText] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commandeId.trim()) {
      setError('Veuillez entrer un numéro de commande');
      return;
    }

    setIsSearching(true);
    setError('');
    setCommande(null);

    try {
      const searchId = commandeId.trim().toLowerCase();
      
      // Rechercher la commande dans Supabase
      // On récupère toutes les commandes et on filtre côté client
      const { data: allCommandes, error: searchError } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchError) {
        console.error('Erreur recherche:', searchError);
        console.error('Détails:', {
          message: searchError.message,
          code: searchError.code,
          details: searchError.details,
          hint: searchError.hint
        });
        setError(`Erreur lors de la recherche: ${searchError.message || 'Erreur inconnue'}`);
        return;
      }

      // Filtrer les commandes qui commencent par l'ID recherché
      const foundCommande = allCommandes?.find(cmd => 
        cmd.id.toLowerCase().startsWith(searchId)
      );

      if (!foundCommande) {
        setError('Aucune commande trouvée avec ce numéro');
        return;
      }

      setCommande(foundCommande as Commande);
      setEditedMenu(foundCommande.repas);
      
      // Initialiser le texte des ingrédients
      const ingredientsTextInit: Record<string, string> = {};
      Object.keys(foundCommande.repas).forEach(jour => {
        ingredientsTextInit[jour] = foundCommande.repas[jour]?.ingredients?.join(', ') || '';
      });
      setIngredientsText(ingredientsTextInit);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEditMenu = () => {
    setIsEditingMenu(true);
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditingMenu(false);
    if (commande) {
      setEditedMenu(commande.repas);
    }
  };

  const handleSaveMenu = async () => {
    if (!commande) return;

    setIsSaving(true);
    setSuccessMessage('');
    setError('');

    try {
      // Convertir le texte des ingrédients en tableau avant de sauvegarder
      const finalMenu: Record<string, MealDetails> = {};
      Object.keys(editedMenu).forEach(jour => {
        finalMenu[jour] = {
          mainDish: editedMenu[jour].mainDish,
          ingredients: ingredientsText[jour]
            ? ingredientsText[jour].split(',').map(i => i.trim()).filter(i => i)
            : []
        };
      });

      const { error: updateError } = await supabase
        .from('commandes')
        .update({ repas: finalMenu })
        .eq('id', commande.id);

      if (updateError) {
        console.error('Erreur mise à jour:', updateError);
        setError('Erreur lors de la sauvegarde du menu');
        return;
      }

      // Mettre à jour l'état local
      setCommande({ ...commande, repas: finalMenu });
      setEditedMenu(finalMenu);
      setIsEditingMenu(false);
      setSuccessMessage('Menu mis à jour avec succès !');
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMeal = (jour: string, field: 'mainDish' | 'ingredients', value: string | string[]) => {
    setEditedMenu(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        [field]: value
      }
    }));
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'confirmee':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_preparation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_livraison':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'livree':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'annulee':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
      
      {/* Logo en haut au centre */}
      <div className="flex justify-center pt-8 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground">
          andunu
        </h1>
      </div>

        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Suivi de commande
          </h2>
          <p className="text-gray-600">
            Entrez votre numéro de commande pour consulter son statut
          </p>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="commandeId" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de commande
              </label>
              <input
                id="commandeId"
                type="text"
                value={commandeId}
                onChange={(e) => setCommandeId(e.target.value)}
                placeholder="Ex: A1B2C3D4"
                disabled={isSearching}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:outline-none text-lg font-mono uppercase disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Le numéro de commande vous a été fourni après le paiement
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching || !commandeId.trim()}
              className={`w-full py-3 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isSearching || !commandeId.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[var(--primary)] text-white hover:opacity-90'
              }`}
            >
              {isSearching && <Spinner size="sm" />}
              {isSearching ? 'Recherche...' : 'Rechercher ma commande'}
            </button>
          </form>
        </div>

        {/* Affichage de la commande */}
        {commande && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* Statut */}
            <div className="text-center pb-6 border-b border-gray-200">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatutColor(commande.statut)}`}>
                  {getStatutLabel(commande.statut)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Commande passée le {formatDate(commande.created_at)}
              </p>
            </div>

            {/* Informations client */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Informations client
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom :</span>
                  <span className="font-medium text-foreground">{commande.client_nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Téléphone :</span>
                  <span className="font-medium text-foreground">{commande.client_telephone}</span>
                </div>
              </div>
            </div>

            {/* Détails de livraison */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                Détails de livraison
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adresse :</span>
                  <span className="font-medium text-foreground text-right">{commande.adresse_livraison}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heure :</span>
                  <span className="font-medium text-foreground">{commande.heure_livraison}</span>
                </div>
              </div>
            </div>

            {/* Menu commandé */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Votre menu
                </h3>
                {!isEditingMenu && (
                  <button
                    onClick={handleEditMenu}
                    className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                )}
              </div>

              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {successMessage}
                </div>
              )}

              <div className="space-y-3">
                {commande.jours_selectionnes.map((jour) => (
                  <div key={jour} className={`py-3 px-4 rounded-lg ${isEditingMenu ? 'bg-white border-2 border-gray-200' : 'bg-gray-50'}`}>
                    {isEditingMenu ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{jour}</span>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Plat principal</label>
                          <input
                            type="text"
                            value={editedMenu[jour]?.mainDish || ''}
                            onChange={(e) => handleUpdateMeal(jour, 'mainDish', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Ex: Riz sauce"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Accompagnements (séparés par des virgules)</label>
                          <input
                            type="text"
                            value={ingredientsText[jour] || ''}
                            onChange={(e) => setIngredientsText(prev => ({ ...prev, [jour]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Ex: Poisson, Œuf, Banane"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">{jour}</span>
                          <span className="text-[var(--primary)] font-medium">
                            {commande.repas[jour]?.mainDish || 'Non défini'}
                          </span>
                        </div>
                        {commande.repas[jour]?.ingredients && commande.repas[jour].ingredients.length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            Avec : {commande.repas[jour].ingredients.join(', ')}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {isEditingMenu && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveMenu}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <Spinner size="sm" />}
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              )}
            </div>

            {/* Résumé du paiement */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mode de paiement :</span>
                  <span className="font-medium text-foreground">
                    {commande.mode_paiement === 'daily' ? 'Paiement par jour' : 'Paiement hebdomadaire'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nombre de jours :</span>
                  <span className="font-medium text-foreground">{commande.jours_selectionnes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut du paiement :</span>
                  <span className={`font-medium ${commande.statut_paiement === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {commande.statut_paiement === 'paid' ? 'Payé' : 'En attente'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-foreground">Total :</span>
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {commande.montant_total.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {/* Bouton retour */}
            <div className="pt-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 bg-gray-200 text-foreground rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => {
                  setCommande(null);
                  setCommandeId('');
                  setError('');
                }}
                className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all font-medium"
              >
                Nouvelle recherche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
