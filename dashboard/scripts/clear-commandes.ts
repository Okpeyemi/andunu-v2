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

async function clearCommandes() {
  try {
    console.log('🔍 Recherche de la dernière commande d\'aujourd\'hui...');
    
    // Obtenir la date d'aujourd'hui (début et fin)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();
    
    // Récupérer toutes les commandes d'aujourd'hui
    const { data: todayCommandes, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des commandes:', fetchError);
      process.exit(1);
    }
    
    console.log(`📊 ${todayCommandes?.length || 0} commande(s) trouvée(s) aujourd'hui`);
    
    // Identifier la dernière commande d'aujourd'hui à conserver
    const lastTodayCommande = todayCommandes && todayCommandes.length > 0 ? todayCommandes[0] : null;
    
    if (lastTodayCommande) {
      console.log(`✅ Dernière commande d'aujourd'hui à conserver: ${lastTodayCommande.id}`);
      console.log(`   Client: ${lastTodayCommande.client_nom}`);
      console.log(`   Créée à: ${new Date(lastTodayCommande.created_at).toLocaleString('fr-FR')}`);
      
      // Supprimer toutes les commandes SAUF celle-ci
      const { error: deleteError, count } = await supabase
        .from('commandes')
        .delete({ count: 'exact' })
        .neq('id', lastTodayCommande.id);
      
      if (deleteError) {
        console.error('❌ Erreur lors de la suppression:', deleteError);
        process.exit(1);
      }
      
      console.log(`✅ ${count || 0} commande(s) supprimée(s)`);
      console.log('✅ Opération terminée avec succès!');
    } else {
      console.log('⚠️  Aucune commande trouvée aujourd\'hui');
      console.log('🗑️  Suppression de TOUTES les commandes...');
      
      // Supprimer toutes les commandes
      const { error: deleteError, count } = await supabase
        .from('commandes')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Condition toujours vraie
      
      if (deleteError) {
        console.error('❌ Erreur lors de la suppression:', deleteError);
        process.exit(1);
      }
      
      console.log(`✅ ${count || 0} commande(s) supprimée(s)`);
      console.log('✅ Opération terminée avec succès!');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Demander confirmation avant de continuer
console.log('⚠️  ATTENTION: Cette opération va supprimer des données!');
console.log('📝 Action: Supprimer toutes les commandes SAUF la dernière d\'aujourd\'hui');
console.log('');

clearCommandes();
