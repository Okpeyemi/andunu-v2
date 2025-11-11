# 🔧 Fix : Récursion infinie dans les RLS policies

## 🐛 Problème

Erreur rencontrée :
```
{
  code: '42P17',
  message: 'infinite recursion detected in policy for relation "users"'
}
```

## 🔍 Cause

Les policies RLS de la table `pack` vérifiaient le rôle admin avec :
```sql
EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
)
```

**Problème :** Si la table `users` a aussi des policies RLS, cela crée une **récursion infinie** :
- Policy de `pack` → vérifie `users`
- Policy de `users` → vérifie quelque chose qui dépend de `pack`
- → Boucle infinie ❌

## ✅ Solution

Utiliser une **fonction `SECURITY DEFINER`** qui s'exécute avec les privilèges du propriétaire, **sans appliquer les RLS** :

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Clé : exécute avec privilèges du propriétaire
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

Puis utiliser cette fonction dans les policies :
```sql
CREATE POLICY "Admins peuvent tout lire"
  ON pack
  FOR SELECT
  TO authenticated
  USING (is_admin());  -- ← Utilise la fonction au lieu de la requête directe
```

## 🚀 Application du fix

### Option 1 : Exécuter le script de fix (RAPIDE)

```bash
# Dans Supabase SQL Editor, exécuter :
scripts/fix-rls-recursion.sql
```

Ce script :
1. Crée la fonction `is_admin()`
2. Supprime les anciennes policies
3. Recrée les policies avec `is_admin()`

### Option 2 : Réexécuter le script complet (PROPRE)

```bash
# Dans Supabase SQL Editor, exécuter :
scripts/create-pack-table.sql
```

Le script a été mis à jour et contient maintenant la fonction `is_admin()`.

## 🧪 Vérification

### 1. Vérifier que la fonction existe
```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'is_admin';
```

Résultat attendu :
```
proname   | prosecdef
----------|----------
is_admin  | true      ← SECURITY DEFINER activé
```

### 2. Vérifier les policies
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'pack';
```

Résultat attendu : 5 policies

### 3. Tester le chargement des packs
```javascript
// Dans la console navigateur
const { data, error } = await supabase
  .from('pack')
  .select('*');

console.log('Packs:', data);
console.log('Erreur:', error);
```

✅ Devrait fonctionner sans erreur de récursion !

## 📊 Comparaison

### ❌ Avant (avec récursion)
```sql
CREATE POLICY "Admins peuvent tout lire"
  ON pack
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users  -- ← Applique les RLS de users → récursion
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### ✅ Après (sans récursion)
```sql
CREATE POLICY "Admins peuvent tout lire"
  ON pack
  FOR SELECT
  TO authenticated
  USING (is_admin());  -- ← Fonction SECURITY DEFINER → pas de récursion
```

## 🔐 Sécurité

### Pourquoi `SECURITY DEFINER` est sûr ici ?

1. **Fonction simple** : Vérifie uniquement le rôle dans `users`
2. **Pas de paramètres** : Utilise seulement `auth.uid()`
3. **Lecture seule** : Ne modifie aucune donnée
4. **Scope limité** : `SET search_path = public` empêche les injections

### Bonnes pratiques

✅ **Utiliser `SECURITY DEFINER` pour :**
- Vérifier des rôles/permissions
- Éviter les récursions RLS
- Fonctions simples et sûres

❌ **Ne PAS utiliser `SECURITY DEFINER` pour :**
- Fonctions complexes avec logique métier
- Fonctions qui modifient des données sensibles
- Fonctions avec paramètres non validés

## 🆘 Dépannage

### Problème : Toujours l'erreur de récursion

**Solution 1 :** Vérifier que la fonction `is_admin()` existe
```sql
SELECT * FROM pg_proc WHERE proname = 'is_admin';
```

**Solution 2 :** Recréer la fonction
```sql
DROP FUNCTION IF EXISTS is_admin();
-- Puis exécuter le script fix-rls-recursion.sql
```

### Problème : Admin ne peut pas accéder

**Cause :** La fonction `is_admin()` ne trouve pas l'utilisateur

**Solution :** Vérifier que l'utilisateur existe dans `users`
```sql
SELECT id, role FROM users WHERE id = auth.uid();
```

Si vide, créer l'entrée :
```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  auth.uid(),
  'votre-email@example.com',
  'Votre Nom',
  'admin'
);
```

### Problème : Fonction introuvable

**Erreur :** `function is_admin() does not exist`

**Solution :** Exécuter le script de création
```sql
-- Dans Supabase SQL Editor
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

## 📝 Notes importantes

1. **`SECURITY DEFINER`** : La fonction s'exécute avec les privilèges du propriétaire de la fonction (généralement `postgres`), donc elle **ignore les RLS** de la table `users`.

2. **Performance** : La fonction est appelée à chaque vérification de policy, mais c'est très rapide car :
   - Requête simple avec index sur `users.id`
   - Pas de récursion
   - Résultat mis en cache pendant la transaction

3. **Maintenance** : Si vous changez la logique de vérification admin, modifiez uniquement la fonction `is_admin()`, pas les 5 policies.

## ✅ Résultat

Après application du fix :
- ✅ Pas d'erreur de récursion
- ✅ Les packs se chargent correctement
- ✅ Les admins peuvent gérer les packs
- ✅ Les utilisateurs voient uniquement les packs disponibles

## 🎉 Succès !

Le système de packs fonctionne maintenant correctement avec RLS, sans récursion infinie ! 🔒

---

**Fichiers mis à jour :**
- `scripts/create-pack-table.sql` - Contient maintenant la fonction `is_admin()`
- `scripts/fix-rls-recursion.sql` - Script de fix rapide si nécessaire
