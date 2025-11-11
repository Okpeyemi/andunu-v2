import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PROJECT_API_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createPackTable() {
  try {
    console.log('🚀 Création de la table pack et mise à jour de la table repas...\n');

    console.log('⚠️  Veuillez exécuter le fichier SQL dans l\'éditeur Supabase:');
    console.log('   scripts/create-pack-table.sql\n');

    console.log('📊 Vérification des packs existants...');

    // Vérifier si les packs existent déjà
    const { data: existingPacks, error: fetchError } = await supabase
      .from('pack')
      .select('*')
      .order('ordre', { ascending: true });

    if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError);
      console.log('\n⚠️  La table pack n\'existe pas encore. Exécutez d\'abord le fichier SQL.');
      process.exit(1);
    }

    if (existingPacks && existingPacks.length > 0) {
      console.log('\n✅ Packs trouvés dans la base de données:');
      console.table(existingPacks.map(p => ({
        Nom: p.name,
        Prix: `${p.price.toLocaleString()} FCFA`,
        Description: p.description || '-',
        Disponible: p.disponible ? 'Oui' : 'Non'
      })));
    } else {
      console.log('\n⚠️  Aucun pack trouvé. Assurez-vous que le fichier SQL a bien été exécuté.');
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

console.log('📦 Système de packs pour les repas');
console.log('===================================\n');

createPackTable();
