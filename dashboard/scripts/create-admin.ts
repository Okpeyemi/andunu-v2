/**
 * Script pour créer l'utilisateur super_admin par défaut
 * 
 * Usage: npx ts-node scripts/create-admin.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSuperAdmin() {
  console.log('🚀 Création du super_admin...\n');

  const adminData = {
    email: 'admin@andunu.com',
    password: 'Admin@2025!', // À changer lors de la première connexion
    phone: '+22961916209',
    full_name: 'Super Administrateur',
    role: 'super_admin'
  };

  try {
    // 1. Créer l'utilisateur avec Supabase Auth
    console.log('📝 Création de l\'utilisateur Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      phone: adminData.phone,
      options: {
        data: {
          full_name: adminData.full_name,
          phone: adminData.phone,
          role: adminData.role
        }
      }
    });

    if (authError) {
      // Vérifier si l'utilisateur existe déjà
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Un utilisateur avec cet email existe déjà');
        
        // Essayer de récupérer le profil existant
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'super_admin')
          .limit(1);

        if (profileError) {
          console.error('❌ Erreur lors de la récupération du profil:', profileError.message);
          return;
        }

        if (profiles && profiles.length > 0) {
          console.log('\n✅ Super admin existant trouvé:');
          console.log('   Email:', adminData.email);
          console.log('   Téléphone:', profiles[0].phone);
          console.log('   Nom:', profiles[0].full_name);
          console.log('   Rôle:', profiles[0].role);
          console.log('   Statut:', profiles[0].status);
          return;
        }
      }
      
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Aucun utilisateur créé');
    }

    console.log('✅ Utilisateur Auth créé avec succès!');
    console.log('   ID:', authData.user.id);

    // 2. Le profil est automatiquement créé par le trigger
    console.log('\n⏳ Attente de la création du profil...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Vérifier que le profil a été créé
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur lors de la vérification du profil:', profileError.message);
      return;
    }

    console.log('✅ Profil créé avec succès!\n');
    console.log('═══════════════════════════════════════');
    console.log('🎉 SUPER ADMIN CRÉÉ AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('📱 Téléphone:', adminData.phone);
    console.log('👤 Nom:', adminData.full_name);
    console.log('🎭 Rôle:', profile.role);
    console.log('✨ Statut:', profile.status);
    console.log('═══════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe lors de la première connexion!');
    console.log('🔗 Page de connexion: /console\n');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création du super_admin:');
    console.error(error.message || error);
    process.exit(1);
  }
}

// Exécuter le script
createSuperAdmin()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
