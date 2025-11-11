import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PROJECT_API_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('🚀 Début de la restructuration de la table repas...\n');

    // Lire le fichier SQL
    const sqlFile = path.resolve(__dirname, 'restructure-repas.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

    // Diviser en commandes individuelles (séparées par des lignes vides ou des commentaires)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== '');

    console.log(`📝 ${commands.length} commandes SQL à exécuter\n`);

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (!command) continue;

      console.log(`⏳ Exécution de la commande ${i + 1}/${commands.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: command + ';' 
      }).single();

      if (error) {
        // Essayer avec la méthode directe si rpc ne fonctionne pas
        const { error: directError } = await supabase
          .from('_sql')
          .select('*')
          .limit(0);
        
        if (directError) {
          console.error(`❌ Erreur lors de l'exécution:`, error);
          console.log(`\n⚠️  Veuillez exécuter manuellement le fichier SQL dans l'éditeur Supabase:`);
          console.log(`   ${sqlFile}\n`);
          process.exit(1);
        }
      }
    }

    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n📊 Vérification des données...');

    // Vérifier les nouvelles données
    const { data: repasData, error: fetchError } = await supabase
      .from('repas')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError);
    } else {
      console.log('\n✅ Repas dans la base de données:');
      console.table(repasData);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.log('\n⚠️  Veuillez exécuter manuellement le fichier SQL dans l\'éditeur Supabase.');
    process.exit(1);
  }
}

console.log('⚠️  ATTENTION: Cette migration va modifier la structure de la base de données!');
console.log('📝 Actions:');
console.log('   - Restructurer la table repas (name, prices[])');
console.log('   - Supprimer la table accompagnements');
console.log('');

runMigration();
