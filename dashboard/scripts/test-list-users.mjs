/**
 * Script pour tester la liste des utilisateurs en tant que super_admin
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxlqcyesghwfwlwjplfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bHFjeWVzZ2h3Zndsd2pwbGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODc0NTEsImV4cCI6MjA3NzE2MzQ1MX0.64J7ngiGJ7ajyUttlAiPeeJGQdzYxZUrU73RWeKkrUQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testListUsers() {
  console.log('🧪 Test de la liste des utilisateurs...\n');

  try {
    // 1. Se connecter en tant que super_admin
    console.log('1️⃣ Connexion en tant que super_admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@andunu.com',
      password: 'Admin@2025!'
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connecté en tant que:', authData.user.email);

    // 2. Récupérer tous les profils
    console.log('\n2️⃣ Récupération de tous les profils...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erreur:', profilesError);
      return;
    }

    console.log(`✅ ${profiles.length} profil(s) trouvé(s):\n`);

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name}`);
      console.log(`   Rôle: ${profile.role}`);
      console.log(`   Statut: ${profile.status}`);
      console.log(`   Téléphone: ${profile.phone}`);
      console.log(`   Créé le: ${new Date(profile.created_at).toLocaleString('fr-FR')}`);
      console.log('');
    });

    // 3. Récupérer les emails
    console.log('3️⃣ Récupération des emails...');
    for (const profile of profiles) {
      const { data: email, error } = await supabase
        .rpc('get_user_email', { user_id: profile.id });

      if (!error && email) {
        console.log(`   ${profile.full_name}: ${email}`);
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 TEST RÉUSSI!');
    console.log('═══════════════════════════════════════\n');

    // Déconnexion
    await supabase.auth.signOut();

  } catch (error) {
    console.error('\n❌ Erreur inattendue:', error);
  }
}

testListUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
