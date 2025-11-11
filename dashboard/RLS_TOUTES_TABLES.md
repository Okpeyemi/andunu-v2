# 🔒 Row Level Security (RLS) - Toutes les tables

## 📋 Vue d'ensemble

Application de **Row Level Security (RLS)** sur les 3 tables principales :
- ✅ **pack** - Packs de prix
- ✅ **repas** - Repas/plats
- ✅ **commandes** - Commandes clients

## 🎯 Objectif

Sécuriser l'accès aux données selon le rôle de l'utilisateur :
- **Public** : Lecture limitée (disponible = true)
- **Admin** : Accès complet (CRUD)

## 🔐 Matrice des permissions

### Table PACK

| Action | Anonyme | Utilisateur | Admin |
|--------|---------|-------------|-------|
| Voir packs disponibles | ✅ | ✅ | ✅ |
| Voir packs indisponibles | ❌ | ❌ | ✅ |
| Créer | ❌ | ❌ | ✅ |
| Modifier | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ |

### Table REPAS

| Action | Anonyme | Utilisateur | Admin |
|--------|---------|-------------|-------|
| Voir repas disponibles | ✅ | ✅ | ✅ |
| Voir repas indisponibles | ❌ | ❌ | ✅ |
| Créer | ❌ | ❌ | ✅ |
| Modifier | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ |

### Table COMMANDES

| Action | Anonyme | Utilisateur | Admin |
|--------|---------|-------------|-------|
| Voir commandes | ✅ | ✅ | ✅ |
| Créer | ❌ | ❌ | ✅ |
| Modifier | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ |

**Note :** Pour les commandes, la lecture est publique (pour la caisse). Ajustez selon vos besoins.

## 🚀 Installation

### Option 1 : Script global (RECOMMANDÉ)

Applique RLS sur toutes les tables en une seule fois :

```bash
# Dans Supabase SQL Editor, exécuter :
scripts/add-rls-all-tables.sql
```

### Option 2 : Scripts individuels

Si vous préférez appliquer RLS table par table :

```bash
# Table pack
scripts/create-pack-table.sql  # (déjà fait si vous avez créé les packs)

# Table repas
scripts/add-rls-repas.sql

# Table commandes
scripts/add-rls-commandes.sql
```

## 📊 Policies créées

### Pour chaque table (pack, repas, commandes)

**5 policies par table = 15 policies au total**

1. **Lecture publique** (SELECT)
   - Pack/Repas : `disponible = true`
   - Commandes : `true` (toutes visibles)

2. **Admins lecture complète** (SELECT)
   - Condition : `is_admin()`

3. **Admins insertion** (INSERT)
   - Condition : `is_admin()`

4. **Admins modification** (UPDATE)
   - Condition : `is_admin()`

5. **Admins suppression** (DELETE)
   - Condition : `is_admin()`

## 🔧 Fonction is_admin()

Une seule fonction partagée par toutes les tables :

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;
```

**Avantages :**
- ✅ Évite la récursion RLS
- ✅ Centralisée (une seule fonction pour toutes les tables)
- ✅ Facile à maintenir
- ✅ Performance optimale

## ✅ Vérifications

### 1. Vérifier que RLS est activé

```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('pack', 'repas', 'commandes')
ORDER BY tablename;
```

Résultat attendu :
```
tablename  | rls_enabled
-----------|------------
commandes  | true
pack       | true
repas      | true
```

### 2. Vérifier les policies

```sql
SELECT 
  tablename,
  COUNT(*) as nombre_policies
FROM pg_policies
WHERE tablename IN ('pack', 'repas', 'commandes')
GROUP BY tablename
ORDER BY tablename;
```

Résultat attendu :
```
tablename  | nombre_policies
-----------|----------------
commandes  | 5
pack       | 5
repas      | 5
```

### 3. Lister toutes les policies

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('pack', 'repas', 'commandes')
ORDER BY tablename, cmd, policyname;
```

## 🧪 Tests

### Test 1 : Utilisateur non connecté

**Console navigateur (F12) :**

```javascript
// Voir les packs disponibles
const { data: packs } = await supabase.from('pack').select('*');
console.log('Packs visibles:', packs);
// ✅ Devrait retourner uniquement les packs avec disponible = true

// Voir les repas disponibles
const { data: repas } = await supabase.from('repas').select('*');
console.log('Repas visibles:', repas);
// ✅ Devrait retourner uniquement les repas avec disponible = true

// Voir les commandes
const { data: commandes } = await supabase.from('commandes').select('*');
console.log('Commandes visibles:', commandes);
// ✅ Devrait retourner toutes les commandes

// Essayer de créer un pack
const { error } = await supabase.from('pack').insert({ name: 'Test', price: 1000 });
console.log('Erreur:', error);
// ❌ Devrait échouer avec RLS policy violation
```

### Test 2 : Administrateur

**Se connecter en tant qu'admin :**

```javascript
// Voir tous les packs (disponibles et indisponibles)
const { data: packs } = await supabase.from('pack').select('*');
console.log('Tous les packs:', packs);
// ✅ Devrait retourner tous les packs

// Créer un pack
const { data, error } = await supabase.from('pack')
  .insert({ name: 'Pack Test', price: 2500 });
console.log('Pack créé:', data, 'Erreur:', error);
// ✅ Devrait réussir

// Modifier un pack
const { error: updateError } = await supabase.from('pack')
  .update({ price: 2600 })
  .eq('name', 'Pack Test');
// ✅ Devrait réussir

// Supprimer un pack
const { error: deleteError } = await supabase.from('pack')
  .delete()
  .eq('name', 'Pack Test');
// ✅ Devrait réussir
```

## 🎨 Personnalisation

### Modifier la policy de lecture des commandes

Si vous voulez restreindre la lecture des commandes :

```sql
-- Au lieu de USING (true), utiliser une condition
DROP POLICY IF EXISTS "Lecture publique des commandes" ON commandes;
CREATE POLICY "Lecture publique des commandes"
  ON commandes
  FOR SELECT
  USING (
    -- Exemple : Uniquement les commandes du jour
    DATE(created_at) = CURRENT_DATE
    -- Ou : Uniquement les commandes non payées
    -- statut_paiement = 'en_attente'
  );
```

### Ajouter une policy pour les utilisateurs authentifiés

```sql
-- Exemple : Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users peuvent voir leurs commandes"
  ON commandes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

## 🚨 Dépannage

### Problème : Récursion infinie

**Erreur :** `infinite recursion detected in policy for relation "users"`

**Solution :** La fonction `is_admin()` utilise `SECURITY DEFINER` pour éviter ce problème. Si l'erreur persiste :

```sql
-- Recréer la fonction
DROP FUNCTION IF EXISTS is_admin();
-- Puis exécuter le script add-rls-all-tables.sql
```

### Problème : Admin ne peut pas accéder

**Cause :** L'utilisateur n'existe pas dans la table `users` ou n'a pas le rôle 'admin'

**Solution :**
```sql
-- Vérifier le rôle
SELECT id, email, role FROM users WHERE id = auth.uid();

-- Si pas admin, mettre à jour
UPDATE users SET role = 'admin' WHERE id = auth.uid();

-- Si l'utilisateur n'existe pas, le créer
INSERT INTO users (id, email, full_name, role)
VALUES (
  auth.uid(),
  'admin@example.com',
  'Admin',
  'admin'
);
```

### Problème : Aucune donnée visible

**Cause :** Toutes les données sont `disponible = false`

**Solution :**
```sql
-- Activer au moins un élément de chaque table
UPDATE pack SET disponible = true WHERE name = 'Pack Standard';
UPDATE repas SET disponible = true LIMIT 1;
```

## 📝 Maintenance

### Désactiver temporairement RLS (debug)

```sql
ALTER TABLE pack DISABLE ROW LEVEL SECURITY;
ALTER TABLE repas DISABLE ROW LEVEL SECURITY;
ALTER TABLE commandes DISABLE ROW LEVEL SECURITY;
```

### Réactiver RLS

```sql
ALTER TABLE pack ENABLE ROW LEVEL SECURITY;
ALTER TABLE repas ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
```

### Supprimer toutes les policies d'une table

```sql
-- Exemple pour la table pack
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'pack'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON pack';
  END LOOP;
END $$;
```

## 📚 Fichiers créés

- ✅ `scripts/add-rls-all-tables.sql` - Script global (RECOMMANDÉ)
- ✅ `scripts/add-rls-commandes.sql` - RLS pour commandes uniquement
- ✅ `scripts/add-rls-repas.sql` - RLS pour repas uniquement
- ✅ `scripts/create-pack-table.sql` - RLS pour pack (déjà inclus)
- ✅ `RLS_TOUTES_TABLES.md` - Cette documentation

## ✅ Checklist finale

Avant de considérer l'installation terminée :

- [ ] Script `add-rls-all-tables.sql` exécuté sans erreur
- [ ] RLS activé sur les 3 tables (pack, repas, commandes)
- [ ] 15 policies créées (5 par table)
- [ ] Fonction `is_admin()` créée
- [ ] Utilisateur anonyme voit uniquement les données disponibles
- [ ] Admin peut voir toutes les données
- [ ] Admin peut créer/modifier/supprimer
- [ ] Utilisateur non-admin ne peut pas modifier
- [ ] Aucune erreur de récursion
- [ ] Application fonctionne correctement

## 🎉 Résultat

Après application du RLS sur toutes les tables :

- 🔒 **Sécurité renforcée** sur pack, repas et commandes
- 👁️ **Visibilité contrôlée** selon le rôle
- 🛡️ **Protection automatique** au niveau base de données
- 📊 **Gestion centralisée** via la fonction `is_admin()`
- ⚡ **Performance optimale** sans récursion

---

**🎊 Système complètement sécurisé avec RLS sur toutes les tables !** 🔒

**Exécutez `scripts/add-rls-all-tables.sql` dans Supabase et testez !** 🚀
