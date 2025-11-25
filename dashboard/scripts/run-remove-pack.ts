import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    console.error('   Veuillez définir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local');
    process.exit(1);
}

// Utiliser la service role key pour avoir tous les privilèges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Début de la migration: Suppression Pack → Création Accompagnements...\n');

        // Lire le fichier SQL
        const sqlFile = path.resolve(__dirname, 'remove-pack-add-accompagnements.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

        console.log('⚠️  ATTENTION: Cette migration va:');
        console.log('   ✓ Supprimer toutes les policies de la table pack');
        console.log('   ✓ Supprimer la colonne pack_ids de la table repas');
        console.log('   ✓ Supprimer complètement la table pack');
        console.log('   ✓ Créer la table accompagnements');
        console.log('   ✓ Créer la table de jonction repas_accompagnements');
        console.log('   ✓ Configurer les RLS policies pour les nouvelles tables\n');

        console.log('📝 Exécution du script SQL...\n');
        console.log('⚠️  Note: Exécutez ce script manuellement dans l\'éditeur SQL de Supabase');
        console.log(`   Fichier: ${sqlFile}\n`);

        // Afficher le contenu du fichier SQL
        console.log('📄 Contenu du script SQL:');
        console.log('='.repeat(80));
        console.log(sqlContent);
        console.log('='.repeat(80));
        console.log('\n');

        console.log('📋 Instructions:');
        console.log('1. Ouvrez le dashboard Supabase: ' + supabaseUrl.replace('supabase.co', 'supabase.co/project/_/sql'));
        console.log('2. Copiez le contenu du fichier SQL ci-dessus');
        console.log('3. Collez-le dans l\'éditeur SQL');
        console.log('4. Exécutez le script');
        console.log('5. Vérifiez les résultats\n');

        console.log('✅ Une fois la migration exécutée manuellement, vous pourrez utiliser les nouvelles tables.');

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

runMigration();
