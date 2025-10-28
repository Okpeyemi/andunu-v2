/**
 * Script pour tester la création d'un super admin
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxlqcyesghwfwlwjplfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bHFjeWVzZ2h3Zndsd2pwbGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODc0NTEsImV4cCI6MjA3NzE2MzQ1MX0.64J7ngiGJ7ajyUttlAiPeeJGQdzYxZUrU73RWeKkrUQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateAdmin() {
  console.log('🧪 Test de création d\'un super admin...\n');

  const testAdmin = {
    full_name: 'Test Admin',
    email: 'testadmin' + Math.random().toString(36).substring(7) + '@gmail.com',
    phone: '+22912345678',
    password: 'TestAdmin@2025!'
  };

  try {
    console.log('1️⃣ Création de l\'utilisateur...');
    console.log('   Email:', testAdmin.email);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testAdmin.email,
      password: testAdmin.password,
      options: {
        data: {
          full_name: testAdmin.full_name,
          phone: testAdmin.phone,
          role: 'super_admin'
        },
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Utilisateur créé!');
    console.log('   User ID:', authData.user.id);

    // Attendre que le trigger crée le profil
    console.log('\n2️⃣ Attente de la création du profil...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Vérifier le profil
    console.log('\n3️⃣ Vérification du profil...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur de récupération du profil:', profileError);
      return;
    }

    if (!profile) {
      console.error('❌ Profil non trouvé');
      return;
    }

    console.log('✅ Profil créé avec succès!');
    console.log('   Nom:', profile.full_name);
    console.log('   Téléphone:', profile.phone);
    console.log('   Rôle:', profile.role);
    console.log('   Statut:', profile.status);

    if (profile.role !== 'super_admin') {
      console.warn('⚠️  ATTENTION: Le rôle n\'est pas super_admin!');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 TEST RÉUSSI!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Erreur inattendue:', error);
  }
}

testCreateAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
