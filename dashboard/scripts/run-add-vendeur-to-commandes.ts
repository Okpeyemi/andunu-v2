import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addVendeurToCommandes() {
    console.log('🚀 Migration: Ajout de la relation vendeurs-commandes\n');

    try {
        // Lire le fichier SQL
        const sqlPath = path.join(__dirname, 'add-vendeur-to-commandes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Exécution de la migration SQL...');

        // Exécuter la migration (en utilisant rpc ou directement via l'API)
        // Note: Supabase client ne supporte pas directement l'exécution de SQL brut
        // Il faut utiliser le SQL Editor de Supabase ou créer une fonction PostgreSQL

        console.log('\n⚠️  ATTENTION:');
        console.log('Cette migration doit être exécutée manuellement dans Supabase SQL Editor.');
        console.log('\nÉtapes:');
        console.log('1. Ouvrir Supabase Dashboard → SQL Editor');
        console.log('2. Copier le contenu de: scripts/add-vendeur-to-commandes.sql');
        console.log('3. Cliquer sur "Run"');
        console.log('\nOu exécuter cette commande si vous avez le CLI Supabase:');
        console.log('supabase db execute -f scripts/add-vendeur-to-commandes.sql\n');

        // Vérification après migration (à décommenter après avoir exécuté la migration)
        console.log('🔍 Vérification de la structure...');

        const { data: commandes, error } = await supabase
            .from('commandes')
            .select('id, vendeur_id')
            .limit(1);

        if (error) {
            if (error.message.includes('column "vendeur_id" does not exist')) {
                console.log('❌ La colonne vendeur_id n\'existe pas encore.');
                console.log('   Veuillez exécuter la migration SQL manuellement.');
            } else {
                console.error('❌ Erreur:', error.message);
            }
        } else {
            console.log('✅ La colonne vendeur_id existe bien!');
            console.log('✅ Migration réussie!\n');

            // Afficher les vendeurs disponibles
            const { data: vendeurs, error: vendeursError } = await supabase
                .from('vendeurs')
                .select('id, nom_complet, actif')
                .order('nom_complet', { ascending: true });

            if (vendeursError) {
                console.error('❌ Erreur lors de la récupération des vendeurs:', vendeursError.message);
            } else if (vendeurs && vendeurs.length > 0) {
                console.log('📋 Vendeurs disponibles:');
                vendeurs.forEach(v => {
                    console.log(`   ${v.actif ? '✓' : '✗'} ${v.nom_complet} (ID: ${v.id})`);
                });
            } else {
                console.log('⚠️  Aucun vendeur trouvé. Créez des vendeurs dans l\'interface.');
            }
        }

    } catch (err) {
        console.error('❌ Erreur inattendue:', err);
        process.exit(1);
    }
}

addVendeurToCommandes().catch(console.error);
