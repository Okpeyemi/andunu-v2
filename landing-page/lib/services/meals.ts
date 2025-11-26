import { supabase } from '../supabase';
import type { Repas, Accompagnement, RepasAccompagnement } from '../supabase';

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
 * Récupère tous les accompagnements disponibles
 */
export async function getAccompagnements(): Promise<Accompagnement[]> {
  console.log('Tentative de récupération des accompagnements...');

  const { data, error } = await supabase
    .from('accompagnements')
    .select('*')
    .eq('disponible', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur détaillée lors de la récupération des accompagnements:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Impossible de récupérer les accompagnements: ${error.message}`);
  }

  console.log('Accompagnements récupérés avec succès:', data);

  if (!data || data.length === 0) {
    console.warn('Aucun accompagnement trouvé dans la base de données');
  }

  return data || [];
}

/**
 * Récupère les accompagnements disponibles pour un repas donné
 */
export async function getAccompagnementsForRepas(repasId: string): Promise<Accompagnement[]> {
  console.log(`Récupération des accompagnements pour le repas ${repasId}...`);

  // Récupérer les IDs des accompagnements liés à ce repas
  const { data: relations, error: relationsError } = await supabase
    .from('repas_accompagnements')
    .select('accompagnement_id')
    .eq('repas_id', repasId);

  if (relationsError) {
    console.error('Erreur lors de la récupération des relations:', relationsError);
    throw new Error('Impossible de récupérer les relations repas-accompagnements');
  }

  if (!relations || relations.length === 0) {
    console.log('Aucun accompagnement lié à ce repas');
    return [];
  }

  const accompagnementIds = relations.map(r => r.accompagnement_id);

  // Récupérer les détails des accompagnements
  const { data: accompagnements, error: accompagnementsError } = await supabase
    .from('accompagnements')
    .select('*')
    .in('id', accompagnementIds)
    .eq('disponible', true)
    .order('name', { ascending: true });

  if (accompagnementsError) {
    console.error('Erreur lors de la récupération des accompagnements:', accompagnementsError);
    throw new Error('Impossible de récupérer les accompagnements');
  }

  console.log(`${accompagnements?.length || 0} accompagnements trouvés pour ce repas`);
  return accompagnements || [];
}
