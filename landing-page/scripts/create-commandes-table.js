/**
 * Script pour créer la table commandes dans Supabase
 * Exécuter avec : node scripts/create-commandes-table.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

console.log('🔧 Création de la table commandes dans Supabase...\n');
console.log(`📍 URL: ${supabaseUrl}`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lire le fichier SQL
const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_commandes_table.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

async function createTable() {
  try {
    console.log('📝 Exécution de la migration SQL...\n');
    
    // Supabase JS client ne supporte pas l'exécution directe de SQL DDL
    // On doit utiliser l'API REST directement
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ query: sqlContent })
    });

    if (!response.ok) {
      // Si la fonction RPC n'existe pas, on doit créer la table manuellement via le dashboard
      console.log('⚠️  L\'API REST ne permet pas d\'exécuter du SQL DDL directement.\n');
      console.log('📋 Instructions pour créer la table manuellement :\n');
      console.log('1. Va sur https://supabase.com/dashboard');
      console.log('2. Sélectionne ton projet');
      console.log('3. Clique sur "SQL Editor" dans le menu');
      console.log('4. Clique sur "New Query"');
      console.log('5. Copie le contenu du fichier suivant :');
      console.log(`   ${sqlPath}`);
      console.log('6. Colle-le dans l\'éditeur et clique sur "Run"\n');
      
      // Afficher le SQL pour faciliter la copie
      console.log('📄 Contenu SQL à copier :\n');
      console.log('─'.repeat(80));
      console.log(sqlContent);
      console.log('─'.repeat(80));
      console.log('');
      
      return;
    }

    console.log('✅ Table créée avec succès !');
    
    // Vérifier que la table existe
    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error.message);
    } else {
      console.log('✅ Vérification réussie - La table commandes est prête !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Solution alternative :');
    console.log('   Exécute le SQL manuellement dans le dashboard Supabase');
    console.log('   Voir le fichier SETUP_SUPABASE.md pour les instructions');
  }
}

createTable();
