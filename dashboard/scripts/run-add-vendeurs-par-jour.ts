import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Migration: Ajout de vendeurs_par_jour\n');

    console.log('⚠️  Cette migration doit être exécutée manuellement dans Supabase SQL Editor.');
    console.log('Fichier: scripts/add-vendeurs-par-jour.sql\n');

    // Vérification après migration
    console.log('🔍 Vérification de la structure...');

    const { data: commandes, error } = await supabase
        .from('commandes')
        .select('id, vendeurs_par_jour, vendeur_id')
        .limit(1);

    if (error) {
        if (error.message.includes('column "vendeurs_par_jour" does not exist')) {
            console.log('❌ La colonne vendeurs_par_jour n\'existe pas encore.');
            console.log('   Veuillez exécuter la migration SQL manuellement.\n');
        } else {
            console.error('❌ Erreur:', error.message);
        }
        return;
    }

    console.log('✅ La colonne vendeurs_par_jour existe!');

    // Vérifier les vendeurs et repas
    const { data: vendeurs } = await supabase
        .from('vendeurs')
        .select('id, nom_complet, actif')
        .eq('actif', true);

    const { data: repas } = await supabase
        .from('repas')
        .select('id, name');

    const { data: vendeurRepas } = await supabase
        .from('vendeur_repas')
        .select('vendeur_id, repas_id');

    console.log(`\n📊 Statistiques:`);
    console.log(`   - Vendeurs actifs: ${vendeurs?.length || 0}`);
    console.log(`   - Repas disponibles: ${repas?.length || 0}`);
    console.log(`   - Associations vendeur-repas: ${vendeurRepas?.length || 0}`);

    if (vendeurRepas && vendeurRepas.length > 0) {
        console.log(`\n✅ Associations vendeur-repas trouvées:`);

        // Grouper par vendeur
        const parVendeur = vendeurRepas.reduce((acc, vr) => {
            if (!acc[vr.vendeur_id]) acc[vr.vendeur_id] = [];
            acc[vr.vendeur_id].push(vr.repas_id);
            return acc;
        }, {} as Record<string, string[]>);

        Object.entries(parVendeur).forEach(([vendeurId, repasIds]) => {
            const vendeur = vendeurs?.find(v => v.id === vendeurId);
            console.log(`   ${vendeur?.nom_complet || vendeurId}: ${repasIds.length} repas`);
        });
    } else {
        console.log(`\n⚠️  Aucune association vendeur-repas trouvée.`);
        console.log(`   Vous devrez créer des associations dans la table vendeur_repas`);
    }

    console.log('\n✨ Vérification terminée!');
}

runMigration().catch(console.error);
