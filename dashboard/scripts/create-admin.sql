-- Script SQL pour créer le super_admin
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/vxlqcyesghwfwlwjplfn/sql/new

-- 1. Créer l'utilisateur dans auth.users avec un mot de passe hashé
-- Mot de passe: Admin@2025!
-- Hash bcrypt du mot de passe (à générer avec bcrypt)

-- Insérer l'utilisateur dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@andunu.com',
  crypt('Admin@2025!', gen_salt('bf')), -- Hash bcrypt du mot de passe
  NOW(),
  '+22961916209',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Super Administrateur","phone":"+22961916209","role":"super_admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id, email, phone;

-- Note: Le trigger on_auth_user_created créera automatiquement le profil dans public.profiles
