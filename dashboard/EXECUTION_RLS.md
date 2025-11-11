# 🔒 Exécution de la migration avec RLS

## ⚡ Démarrage rapide

### 1️⃣ Exécuter la migration SQL (avec RLS)

**Ouvrez Supabase SQL Editor et exécutez :**
```bash
scripts/create-pack-table.sql
```

Ce fichier contient maintenant :
- ✅ Création de la table `pack`
- ✅ Insertion des 3 packs par défaut
- ✅ Modification de la table `repas` (ajout de `pack_ids`)
- ✅ **Activation de Row Level Security**
- ✅ **Création des 5 policies RLS**

### 2️⃣ Vérifier l'installation

```bash
npx tsx scripts/run-create-pack.ts
```

### 3️⃣ Vérifier les RLS policies

Dans Supabase SQL Editor :
```sql
SELECT 
  policyname, 
  cmd, 
  roles,
  qual
FROM pg_policies
WHERE tablename = 'pack';
```

Vous devriez voir **5 policies** :

| Policy Name | Command | Roles |
|-------------|---------|-------|
| Lecture publique des packs disponibles | SELECT | public |
| Admins peuvent tout lire | SELECT | authenticated |
| Admins peuvent insérer | INSERT | authenticated |
| Admins peuvent modifier | UPDATE | authenticated |
| Admins peuvent supprimer | DELETE | authenticated |

### 4️⃣ Tester l'interface

```bash
npm run dev
# Ouvrir: http://localhost:3000/meals
# Cliquer sur l'onglet "Packs de prix"
```

## 🧪 Tests de sécurité

### Test 1 : Utilisateur non connecté

**Dans la console navigateur (F12) :**
```javascript
// Essayer de lire les packs
const { data, error } = await supabase
  .from('pack')
  .select('*');

console.log('Packs visibles:', data);
// Devrait retourner uniquement les packs avec disponible = true
```

```javascript
// Essayer de créer un pack
const { data, error } = await supabase
  .from('pack')
  .insert({ name: 'Pack Test', price: 3000 });

console.log('Erreur:', error);
// Devrait retourner une erreur RLS policy violation
```

### Test 2 : Utilisateur connecté (non admin)

**Se connecter avec un compte utilisateur normal :**
```javascript
// Essayer de créer un pack
const { data, error } = await supabase
  .from('pack')
  .insert({ name: 'Pack Test', price: 3000 });

console.log('Erreur:', error);
// Devrait retourner une erreur RLS policy violation
```

### Test 3 : Administrateur

**Se connecter avec un compte admin :**

1. **Voir tous les packs** (disponibles et indisponibles)
   - Aller sur l'onglet "Packs de prix"
   - Tous les packs doivent être visibles

2. **Créer un pack**
   - Cliquer sur "Ajouter un pack"
   - Remplir le formulaire
   - Cliquer sur "Ajouter"
   - ✅ Devrait réussir

3. **Modifier un pack**
   - Cliquer sur "Modifier" pour un pack
   - Changer le prix
   - Cliquer sur "Modifier"
   - ✅ Devrait réussir

4. **Supprimer un pack**
   - Cliquer sur "Supprimer" pour un pack
   - Confirmer la suppression
   - ✅ Devrait réussir

## 🔍 Vérifications SQL

### Vérifier que RLS est activé
```sql
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename = 'pack';
```

Résultat attendu : `rowsecurity = true`

### Vérifier les policies
```sql
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pack'
ORDER BY cmd, policyname;
```

Résultat attendu : 5 policies

### Tester en tant qu'utilisateur anonyme
```sql
SET ROLE anon;
SELECT * FROM pack;
-- Devrait retourner uniquement les packs avec disponible = true

INSERT INTO pack (name, price) VALUES ('Pack Test', 3000);
-- Devrait échouer avec une erreur RLS
```

### Tester en tant qu'admin
```sql
-- D'abord, vérifier votre rôle
SELECT id, role FROM users WHERE id = auth.uid();

-- Si vous êtes admin, ces requêtes devraient fonctionner
SELECT * FROM pack; -- Tous les packs
INSERT INTO pack (name, price) VALUES ('Pack Test', 3000); -- Succès
UPDATE pack SET price = 3500 WHERE name = 'Pack Test'; -- Succès
DELETE FROM pack WHERE name = 'Pack Test'; -- Succès
```

## 📊 Résultats attendus

### Matrice de permissions

| Action | Anonyme | Utilisateur | Admin |
|--------|---------|-------------|-------|
| SELECT (disponible=true) | ✅ | ✅ | ✅ |
| SELECT (disponible=false) | ❌ | ❌ | ✅ |
| INSERT | ❌ | ❌ | ✅ |
| UPDATE | ❌ | ❌ | ✅ |
| DELETE | ❌ | ❌ | ✅ |

### Comportement de l'interface

**Utilisateur non connecté :**
- Peut voir les packs disponibles dans le formulaire de repas
- Ne peut pas accéder à l'onglet "Packs de prix" (ou voit uniquement les disponibles)

**Utilisateur connecté (non admin) :**
- Peut voir les packs disponibles dans le formulaire de repas
- Ne peut pas gérer les packs

**Administrateur :**
- Peut voir tous les packs (disponibles et indisponibles)
- Peut créer, modifier, supprimer des packs
- Peut activer/désactiver des packs

## 🚨 Dépannage

### Problème : "new row violates row-level security policy"

**Cause :** Vous essayez de créer/modifier un pack sans être admin

**Solutions :**
1. Vérifier que vous êtes connecté
2. Vérifier votre rôle : `SELECT role FROM users WHERE id = auth.uid()`
3. Si le rôle n'est pas 'admin', le mettre à jour :
   ```sql
   UPDATE users SET role = 'admin' WHERE id = auth.uid();
   ```

### Problème : Aucun pack visible

**Cause :** Tous les packs sont `disponible = false` et vous n'êtes pas admin

**Solutions :**
1. Se connecter en tant qu'admin
2. Ou activer au moins un pack :
   ```sql
   UPDATE pack SET disponible = true WHERE name = 'Pack Standard';
   ```

### Problème : Les policies ne s'appliquent pas

**Cause :** RLS n'est pas activé

**Solution :**
```sql
ALTER TABLE pack ENABLE ROW LEVEL SECURITY;
```

### Problème : Admin ne peut pas modifier

**Cause :** La policy vérifie le rôle dans la table `users` mais l'utilisateur n'existe pas

**Solution :**
```sql
-- Vérifier si l'utilisateur existe dans la table users
SELECT * FROM users WHERE id = auth.uid();

-- Si non, créer l'entrée
INSERT INTO users (id, email, full_name, role)
VALUES (
  auth.uid(),
  'admin@example.com',
  'Admin',
  'admin'
);
```

## 📝 Commandes utiles

### Désactiver temporairement RLS (pour debug)
```sql
ALTER TABLE pack DISABLE ROW LEVEL SECURITY;
```

### Réactiver RLS
```sql
ALTER TABLE pack ENABLE ROW LEVEL SECURITY;
```

### Voir toutes les tables avec RLS activé
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE rowsecurity = true;
```

### Supprimer toutes les policies d'une table
```sql
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

## ✅ Checklist finale

Avant de considérer l'installation terminée :

- [ ] Migration SQL exécutée sans erreur
- [ ] 3 packs par défaut présents dans la table
- [ ] RLS activé sur la table pack
- [ ] 5 policies créées et visibles
- [ ] Utilisateur anonyme peut voir uniquement les packs disponibles
- [ ] Admin peut voir tous les packs
- [ ] Admin peut créer un pack
- [ ] Admin peut modifier un pack
- [ ] Admin peut supprimer un pack
- [ ] Utilisateur non-admin ne peut pas modifier
- [ ] Interface `/meals` fonctionne correctement
- [ ] Onglet "Packs de prix" accessible
- [ ] Formulaire d'ajout de pack fonctionne
- [ ] Aucune erreur TypeScript

## 🎉 Succès !

Si tous les tests passent, votre système de packs avec RLS est **complètement fonctionnel et sécurisé** ! 🔒

---

**Documentation complète :** Consultez `RLS_PACK_POLICIES.md` pour plus de détails sur les policies.
