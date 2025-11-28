import { supabase } from './supabase';
import type { Commande } from './supabase';

/**
 * Trouve le vendeur associé à un repas spécifique
 * @param repasName - Nom du repas
 * @returns L'ID du premier vendeur actif trouvé, ou null si aucun
 */
export async function getVendeurForRepas(repasName: string): Promise<string | null> {
    try {
        // 1. Trouver le repas par nom
        const { data: repas, error: repasError } = await supabase
            .from('repas')
            .select('id')
            .eq('name', repasName)
            .single();

        if (repasError || !repas) {
            console.warn(`Repas "${repasName}" non trouvé`, repasError);
            return null;
        }

        // 2. Trouver les vendeurs associés à ce repas
        const { data: vendeurRepas, error: vrError } = await supabase
            .from('vendeur_repas')
            .select('vendeur_id')
            .eq('repas_id', repas.id);

        if (vrError || !vendeurRepas || vendeurRepas.length === 0) {
            console.warn(`Aucun vendeur trouvé pour le repas "${repasName}"`, vrError);
            return null;
        }

        // 3. Vérifier que le vendeur est actif
        const vendeurIds = vendeurRepas.map(vr => vr.vendeur_id);
        const { data: vendeurs, error: vendeursError } = await supabase
            .from('vendeurs')
            .select('id')
            .in('id', vendeurIds)
            .eq('actif', true)
            .limit(1);

        if (vendeursError || !vendeurs || vendeurs.length === 0) {
            console.warn(`Aucun vendeur actif trouvé pour le repas "${repasName}"`);
            return null;
        }

        return vendeurs[0].id;
    } catch (error) {
        console.error('Erreur dans getVendeurForRepas:', error);
        return null;
    }
}

/**
 * Assigne automatiquement les vendeurs pour chaque jour d'une commande
 * @param commande - La commande avec les repas par jour
 * @returns Un objet mapping jour -> vendeur_id
 */
export async function assignVendeursToCommande(
    commande: Pick<Commande, 'jours_selectionnes' | 'repas'>
): Promise<Record<string, string>> {
    const vendeurs_par_jour: Record<string, string> = {};

    for (const jour of commande.jours_selectionnes) {
        const repasJour = commande.repas[jour];

        if (!repasJour || !repasJour.mainDish) {
            console.warn(`Pas de repas principal pour ${jour}`);
            continue;
        }

        const vendeurId = await getVendeurForRepas(repasJour.mainDish);

        if (vendeurId) {
            vendeurs_par_jour[jour] = vendeurId;
        } else {
            console.warn(`Aucun vendeur assigné pour ${jour} (${repasJour.mainDish})`);
        }
    }

    return vendeurs_par_jour;
}

/**
 * Extrait la liste unique des vendeurs impliqués dans une commande
 * @param vendeurs_par_jour - Mapping jour -> vendeur_id
 * @returns Liste unique des IDs de vendeurs
 */
export function getVendeursUniques(vendeurs_par_jour: Record<string, string> | undefined): string[] {
    if (!vendeurs_par_jour) return [];

    const vendeurIds = Object.values(vendeurs_par_jour).filter(Boolean);
    return [...new Set(vendeurIds)];
}

/**
 * Récupère les informations complètes des vendeurs pour une commande
 * @param vendeurs_par_jour - Mapping jour -> vendeur_id
 * @returns Map vendeur_id -> nom_complet
 */
export async function getVendeursInfo(
    vendeurs_par_jour: Record<string, string> | undefined
): Promise<Map<string, string>> {
    const vendeurIds = getVendeursUniques(vendeurs_par_jour);
    const vendeursMap = new Map<string, string>();

    if (vendeurIds.length === 0) return vendeursMap;

    try {
        const { data: vendeurs, error } = await supabase
            .from('vendeurs')
            .select('id, nom_complet')
            .in('id', vendeurIds);

        if (error) {
            console.error('Erreur lors de la récupération des vendeurs:', error);
            return vendeursMap;
        }

        vendeurs?.forEach(v => {
            vendeursMap.set(v.id, v.nom_complet);
        });

        return vendeursMap;
    } catch (error) {
        console.error('Erreur dans getVendeursInfo:', error);
        return vendeursMap;
    }
}
