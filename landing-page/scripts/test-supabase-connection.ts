/**
 * Script pour tester la connexion Supabase et vérifier la table commandes
 * 
 * Exécuter avec : npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Charger les variables d'environnement depuis .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');

const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🔍 Vérification de la configuration Supabase...\n');

// Vérifier les variables d'environnement
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL n\'est pas défini');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY n\'est pas défini');
  process.exit(1);
}

console.log('✅ Variables d\'environnement trouvées');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey.slice(0, 20)}...`);
console.log('');

// Créer le client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Test de connexion à Supabase...');
    
    // Tester la connexion en récupérant les tables
    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      console.error('\n📋 Détails de l\'erreur:');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      
      if (error.message.includes('does not exist')) {
        console.error('\n💡 Solution: La table "commandes" n\'existe pas.');
        console.error('   Exécute le fichier SQL dans supabase/migrations/create_commandes_table.sql');
        console.error('   Voir SETUP_SUPABASE.md pour les instructions');
      }
      
      process.exit(1);
    }

    console.log('✅ Connexion réussie !');
    console.log(`   Nombre de commandes: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📦 Exemple de commande:');
      console.log(JSON.stringify(data[0], null, 2));
    }

    console.log('\n✨ Tout est prêt ! Tu peux maintenant créer des commandes.');
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
    process.exit(1);
  }
}

testConnection();
