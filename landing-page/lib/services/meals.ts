import { supabase } from '../supabase';
import type { Pack, Repas } from '../supabase';

/**
 * Récupère tous les packs disponibles, triés par ordre
 */
export async function getPacks(): Promise<Pack[]> {
  console.log('Tentative de récupération des packs...');
  
  const { data, error } = await supabase
    .from('pack')
    .select('*')
    .eq('disponible', true)
    .order('ordre', { ascending: true });

  if (error) {
    console.error('Erreur détaillée lors de la récupération des packs:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Impossible de récupérer les packs: ${error.message}`);
  }

  console.log('Packs récupérés avec succès:', data);
  return data || [];
}

/**
 * Récupère tous les repas disponibles
 */
export async function getRepas(): Promise<Repas[]> {
  console.log('Tentative de récupération des repas...');
  
  const { data, error } = await supabase
    .from('repas')
    .select('*')
    .eq('disponible', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur détaillée lors de la récupération des repas:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Impossible de récupérer les repas: ${error.message}`);
  }

  console.log('Repas récupérés avec succès:', data);
  
  if (!data || data.length === 0) {
    console.warn('Aucun repas trouvé dans la base de données');
  }

  return data || [];
}

/**
 * Récupère les repas compatibles avec un pack donné
 */
export async function getRepasByPack(packId: string): Promise<Repas[]> {
  const { data, error } = await supabase
    .from('repas')
    .select('*')
    .eq('disponible', true)
    .contains('pack_ids', [packId])
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des repas par pack:', error);
    throw new Error('Impossible de récupérer les repas pour ce pack');
  }

  return data || [];
}

/**
 * Interface pour les données transformées compatibles avec le composant existant
 */
export interface MealWithPrices {
  name: string;
  prices: number[];
}

/**
 * Transforme les données de la base en format compatible avec le composant existant
 */
export function transformRepasToMealWithPrices(repas: Repas[], packs: Pack[]): MealWithPrices[] {
  console.log('Transformation des données:', { repasCount: repas.length, packsCount: packs.length });
  
  if (!repas || repas.length === 0) {
    console.warn('Aucun repas à transformer');
    return [];
  }
  
  if (!packs || packs.length === 0) {
    console.warn('Aucun pack disponible pour la transformation');
    return [];
  }
  
  const result = repas.map(meal => {
    // Trouve les packs compatibles avec ce repas
    const compatiblePacks = packs.filter(pack => 
      meal.pack_ids.includes(pack.id)
    );
    
    // Extrait les prix des packs compatibles
    const prices = compatiblePacks.map(pack => pack.price).sort((a, b) => a - b);
    
    if (prices.length === 0) {
      console.warn(`Aucun pack compatible trouvé pour le repas: ${meal.name}`);
    }
    
    return {
      name: meal.name,
      prices: prices
    };
  }).filter(meal => meal.prices.length > 0); // Filtrer les repas sans prix
  
  console.log('Résultat de la transformation:', result);
  return result;
}
