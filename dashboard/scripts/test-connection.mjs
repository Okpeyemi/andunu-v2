/**
 * Script pour tester la connexion Supabase et vérifier le profil admin
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxlqcyesghwfwlwjplfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bHFjeWVzZ2h3Zndsd2pwbGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODc0NTEsImV4cCI6MjA3NzE2MzQ1MX0.64J7ngiGJ7ajyUttlAiPeeJGQdzYxZUrU73RWeKkrUQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Test de connexion Supabase...\n');

  try {
    // 1. Tester la connexion
    console.log('1️⃣ Test de connexion avec les identifiants admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@andunu.com',
      password: 'Admin@2025!'
    });

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError.message);
      return;
    }

    console.log('✅ Authentification réussie!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // 2. Récupérer le profil
    console.log('\n2️⃣ Récupération du profil...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur de récupération du profil:', profileError);
      console.error('   Code:', profileError.code);
      console.error('   Message:', profileError.message);
      console.error('   Details:', profileError.details);
      console.error('   Hint:', profileError.hint);
      return;
    }

    if (!profile) {
      console.error('❌ Profil introuvable');
      return;
    }

    console.log('✅ Profil récupéré avec succès!');
    console.log('   Nom:', profile.full_name);
    console.log('   Téléphone:', profile.phone);
    console.log('   Rôle:', profile.role);
    console.log('   Statut:', profile.status);

    // 3. Tester la mise à jour
    console.log('\n3️⃣ Test de mise à jour du profil...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('❌ Erreur de mise à jour:', updateError.message);
      return;
    }

    console.log('✅ Mise à jour réussie!');

    // 4. Déconnexion
    console.log('\n4️⃣ Déconnexion...');
    await supabase.auth.signOut();
    console.log('✅ Déconnexion réussie!');

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 TOUS LES TESTS SONT PASSÉS!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Erreur inattendue:', error);
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
