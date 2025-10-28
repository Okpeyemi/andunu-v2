# Configuration Supabase - Andunu Dashboard

## 📋 Vue d'ensemble

Ce document décrit la configuration Supabase pour le système d'authentification et de gestion des utilisateurs d'Andunu.

## 🗄️ Structure de la base de données

### Table `profiles`

Extension de `auth.users` pour stocker les informations supplémentaires des utilisateurs.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'client',
  status account_status NOT NULL DEFAULT 'active',
  address TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Types ENUM

- **user_role**: `'super_admin'` | `'client'`
- **account_status**: `'active'` | `'inactive'` | `'suspended'`

## 👤 Utilisateur Super Admin par défaut

Un utilisateur super_admin a été créé avec les identifiants suivants :

```
📧 Email: admin@andunu.com
🔑 Mot de passe: Admin@2025!
📱 Téléphone: +22961916209
👤 Nom: Super Administrateur
🎭 Rôle: super_admin
✨ Statut: active
```

⚠️ **IMPORTANT**: Changez le mot de passe lors de la première connexion !

## 🔐 Sécurité

### Row Level Security (RLS)

RLS est activé sur la table `profiles` avec les politiques suivantes :

1. **Super admins** peuvent voir tous les profils
2. **Utilisateurs** peuvent voir leur propre profil
3. **Utilisateurs** peuvent mettre à jour leur propre profil
4. **Super admins** peuvent mettre à jour n'importe quel profil

### Triggers

- **on_auth_user_created**: Crée automatiquement un profil dans `public.profiles` lors de l'inscription
- **set_updated_at**: Met à jour automatiquement `updated_at` lors des modifications

## 🚀 Utilisation

### Connexion Console Admin

1. Accédez à `/console`
2. Utilisez les identifiants du super_admin
3. Vous serez redirigé vers le dashboard après authentification

### Authentification dans le code

```typescript
import { supabase } from '@/lib/supabase';

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@andunu.com',
  password: 'Admin@2025!'
});

// Récupérer le profil
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', data.user.id)
  .single();

// Vérifier le rôle
if (profile.role === 'super_admin') {
  // Accès admin
}
```

## 📝 Scripts disponibles

### Créer un admin (SQL)

```bash
# Exécuter dans le SQL Editor de Supabase
cat scripts/create-admin.sql
```

### Créer un admin (Node.js)

```bash
# Nécessite Node.js et les variables d'environnement
node scripts/create-admin.mjs
```

## 🔧 Variables d'environnement

Fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://vxlqcyesghwfwlwjplfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Migrations appliquées

1. **create_users_profiles_table**: Création de la table profiles avec RLS et triggers
2. **fix_auth_trigger**: Correction du trigger de création automatique de profil

## 🔗 Liens utiles

- **Supabase Dashboard**: https://supabase.com/dashboard/project/vxlqcyesghwfwlwjplfn
- **Console Admin**: http://localhost:3001/console
- **Documentation Supabase Auth**: https://supabase.com/docs/guides/auth

## 📌 Notes importantes

1. Le profil est créé automatiquement lors de l'inscription via le trigger `on_auth_user_created`
2. Les clients s'inscriront via la landing page (Step 6) - **à implémenter plus tard**
3. Seuls les super_admins peuvent accéder à la console d'administration
4. La dernière connexion est enregistrée automatiquement lors du login

## 🚧 À venir

- [ ] Intégration de l'inscription client depuis la landing page (Step 6)
- [ ] Vérification OTP pour les nouveaux clients
- [ ] Page de gestion des utilisateurs dans le dashboard admin
- [ ] Système de réinitialisation de mot de passe
- [ ] Logs d'activité des administrateurs
