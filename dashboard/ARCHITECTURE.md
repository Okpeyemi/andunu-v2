# Architecture de la base de données - Andunu

## 📊 Structure des tables

### 1. `auth.users` (Table système Supabase)

**Gérée par** : Supabase Auth (automatique)

**Contenu** :
- `id` : UUID unique de l'utilisateur
- `email` : Email de connexion
- `encrypted_password` : Mot de passe hashé
- `email_confirmed_at` : Date de confirmation de l'email
- `phone` : Numéro de téléphone (optionnel)
- `raw_user_meta_data` : Métadonnées personnalisées (JSON)
- `created_at`, `updated_at` : Timestamps

**Caractéristiques** :
- ✅ Créée automatiquement lors de `signUp()`
- ✅ Gère l'authentification (login, logout, reset password)
- ⚠️ **Non accessible directement via l'API REST** (pour la sécurité)
- ⚠️ Seules certaines fonctions `SECURITY DEFINER` peuvent y accéder

**Accès** :
```sql
-- Accessible uniquement via des fonctions SECURITY DEFINER
SELECT * FROM auth.users; -- ❌ Interdit via l'API
```

---

### 2. `public.profiles` (Table personnalisée)

**Gérée par** : Notre application

**Contenu** :
- `id` : UUID (clé étrangère vers `auth.users.id`)
- `full_name` : Nom complet
- `phone` : Téléphone
- `role` : Rôle (super_admin, client)
- `status` : Statut (active, inactive, suspended)
- `address` : Adresse (optionnel)
- `last_login_at` : Dernière connexion
- `created_at`, `updated_at` : Timestamps

**Caractéristiques** :
- ✅ Créée automatiquement par un trigger lors de `signUp()`
- ✅ Accessible via l'API REST avec Row Level Security (RLS)
- ✅ Contient les données métier de l'utilisateur
- ✅ Peut être étendue avec d'autres champs

**Accès** :
```typescript
// Accessible via l'API Supabase
const { data, error } = await supabase
  .from('profiles')
  .select('*');
```

---

## 🔐 Row Level Security (RLS)

### Politiques actuelles

#### Lecture (`SELECT`)
```sql
-- Un utilisateur peut :
-- 1. Voir son propre profil
-- 2. Si super_admin : voir TOUS les profils

CREATE POLICY "enable_read_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR
    public.is_super_admin(auth.uid())
  );
```

#### Mise à jour (`UPDATE`)
```sql
-- Un utilisateur peut :
-- 1. Modifier son propre profil
-- 2. Si super_admin : modifier TOUS les profils

CREATE POLICY "enable_update_profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR
    public.is_super_admin(auth.uid())
  );
```

#### Insertion (`INSERT`)
```sql
-- Nécessaire pour le trigger de création automatique
CREATE POLICY "enable_insert_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

---

## 🔄 Flux de création d'utilisateur

### 1. Inscription via `signUp()`

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      phone: '+229XXXXXXXX',
      role: 'client' // ou 'super_admin'
    }
  }
});
```

### 2. Trigger automatique

Le trigger `on_auth_user_created` s'exécute automatiquement :

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Création du profil

La fonction `handle_new_user()` crée le profil :

```sql
INSERT INTO public.profiles (id, full_name, phone, role, status)
VALUES (
  NEW.id, -- ID de auth.users
  COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
  COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
  COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
  'active'
);
```

### 4. Résultat

- ✅ Utilisateur créé dans `auth.users`
- ✅ Profil créé dans `public.profiles`
- ✅ Les deux tables sont liées par l'`id`

---

## 🛠️ Fonctions utilitaires

### `is_super_admin(user_id)`

Vérifie si un utilisateur est super_admin :

```sql
CREATE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER -- Évite la récursion RLS
```

**Utilisation** :
```sql
SELECT public.is_super_admin(auth.uid()); -- true ou false
```

### `get_user_email(user_id)`

Récupère l'email d'un utilisateur depuis `auth.users` :

```sql
CREATE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
SECURITY DEFINER -- Accès à auth.users
```

**Utilisation** :
```typescript
const { data: email } = await supabase
  .rpc('get_user_email', { user_id: userId });
```

---

## 📋 Bonnes pratiques

### ✅ À FAIRE

1. **Toujours utiliser `profiles` pour les données métier**
   ```typescript
   // ✅ Bon
   const { data } = await supabase
     .from('profiles')
     .select('full_name, role, status');
   ```

2. **Utiliser les fonctions RPC pour accéder à `auth.users`**
   ```typescript
   // ✅ Bon
   const { data } = await supabase
     .rpc('get_user_email', { user_id });
   ```

3. **Vérifier le rôle côté serveur (RLS)**
   - Les politiques RLS garantissent la sécurité
   - Même si le frontend est compromis, les données sont protégées

### ❌ À ÉVITER

1. **Ne jamais accéder directement à `auth.users` via l'API**
   ```typescript
   // ❌ Mauvais - Ne fonctionnera pas
   const { data } = await supabase
     .from('auth.users')
     .select('*');
   ```

2. **Ne pas stocker de données métier dans `raw_user_meta_data`**
   - Utilisez `profiles` à la place
   - `raw_user_meta_data` est pour l'initialisation uniquement

3. **Ne pas créer de politiques RLS récursives**
   - Utilisez `SECURITY DEFINER` pour éviter la récursion
   - Exemple : `is_super_admin()` fonction

---

## 🔍 Débogage

### Vérifier le nombre d'utilisateurs

```sql
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles
FROM auth.users;
```

### Vérifier les profils avec emails

```sql
SELECT p.*, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;
```

### Tester les politiques RLS

```sql
-- Se connecter en tant qu'utilisateur spécifique
SET request.jwt.claim.sub = 'user-uuid-here';

-- Tester la lecture
SELECT * FROM public.profiles;
```

---

## 📊 Schéma relationnel

```
┌─────────────────────┐
│   auth.users        │
│  (Supabase Auth)    │
├─────────────────────┤
│ id (PK)             │◄─────┐
│ email               │      │
│ encrypted_password  │      │
│ phone               │      │
│ raw_user_meta_data  │      │
│ created_at          │      │
└─────────────────────┘      │
                             │ 1:1
                             │
┌─────────────────────┐      │
│  public.profiles    │      │
│  (Notre table)      │      │
├─────────────────────┤      │
│ id (PK, FK)         │──────┘
│ full_name           │
│ phone               │
│ role                │
│ status              │
│ address             │
│ last_login_at       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

---

## 🎯 Résumé

| Aspect | `auth.users` | `public.profiles` |
|--------|--------------|-------------------|
| **Gestion** | Supabase Auth | Notre application |
| **Accès API** | ❌ Non (sécurité) | ✅ Oui (avec RLS) |
| **Contenu** | Auth + métadonnées | Données métier |
| **Création** | `signUp()` | Trigger automatique |
| **Modification** | Fonctions Auth | API REST |
| **Lecture** | Fonctions RPC | API REST |

**Règle d'or** : Utilisez `public.profiles` pour tout ce qui concerne les données métier de l'utilisateur !
