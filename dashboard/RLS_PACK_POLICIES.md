# 🔒 Row Level Security (RLS) sur la table Pack

## 📋 Vue d'ensemble

Les **Row Level Security (RLS) policies** ont été ajoutées sur la table `pack` pour sécuriser l'accès aux données selon le rôle de l'utilisateur.

## 🛡️ Policies implémentées

### 1. Lecture publique des packs disponibles
```sql
CREATE POLICY "Lecture publique des packs disponibles"
  ON pack
  FOR SELECT
  USING (disponible = true);
```

**Qui ?** Tout le monde (authentifié ou non)  
**Quoi ?** Peut lire uniquement les packs où `disponible = true`  
**Pourquoi ?** Permet aux utilisateurs de voir les packs disponibles lors de la sélection

### 2. Admins peuvent tout lire
```sql
CREATE POLICY "Admins peuvent tout lire"
  ON pack
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**Qui ?** Administrateurs authentifiés  
**Quoi ?** Peuvent lire tous les packs (disponibles et indisponibles)  
**Pourquoi ?** Permet aux admins de gérer tous les packs depuis l'interface

### 3. Admins peuvent insérer
```sql
CREATE POLICY "Admins peuvent insérer"
  ON pack
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**Qui ?** Administrateurs authentifiés  
**Quoi ?** Peuvent créer de nouveaux packs  
**Pourquoi ?** Seuls les admins peuvent ajouter des packs

### 4. Admins peuvent modifier
```sql
CREATE POLICY "Admins peuvent modifier"
  ON pack
  FOR UPDATE
  TO authenticated
  USING (...)
  WITH CHECK (...);
```

**Qui ?** Administrateurs authentifiés  
**Quoi ?** Peuvent modifier tous les packs existants  
**Pourquoi ?** Seuls les admins peuvent éditer les packs

### 5. Admins peuvent supprimer
```sql
CREATE POLICY "Admins peuvent supprimer"
  ON pack
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**Qui ?** Administrateurs authentifiés  
**Quoi ?** Peuvent supprimer des packs  
**Pourquoi ?** Seuls les admins peuvent supprimer des packs

## 🔐 Matrice des permissions

| Action          | Utilisateur anonyme | Utilisateur authentifié | Admin |
|-----------------|---------------------|-------------------------|-------|
| Lire (disponible = true) | ✅ Oui | ✅ Oui | ✅ Oui |
| Lire (disponible = false) | ❌ Non | ❌ Non | ✅ Oui |
| Créer           | ❌ Non              | ❌ Non                  | ✅ Oui |
| Modifier        | ❌ Non              | ❌ Non                  | ✅ Oui |
| Supprimer       | ❌ Non              | ❌ Non                  | ✅ Oui |

## 📊 Cas d'usage

### Cas 1 : Utilisateur non connecté
```javascript
// Peut voir uniquement les packs disponibles
const { data } = await supabase
  .from('pack')
  .select('*');
// Retourne : Pack Standard, Pack Medium, Pack Premium (si disponibles)
```

### Cas 2 : Utilisateur connecté (non admin)
```javascript
// Peut voir uniquement les packs disponibles
const { data } = await supabase
  .from('pack')
  .select('*');
// Retourne : Pack Standard, Pack Medium, Pack Premium (si disponibles)

// Ne peut pas créer de pack
const { error } = await supabase
  .from('pack')
  .insert({ name: 'Pack XL', price: 2500 });
// Retourne : Error - RLS policy violation
```

### Cas 3 : Administrateur
```javascript
// Peut voir TOUS les packs
const { data } = await supabase
  .from('pack')
  .select('*');
// Retourne : Tous les packs (disponibles et indisponibles)

// Peut créer un pack
const { data } = await supabase
  .from('pack')
  .insert({ name: 'Pack XL', price: 2500 });
// Succès ✅

// Peut modifier un pack
const { data } = await supabase
  .from('pack')
  .update({ price: 2200 })
  .eq('name', 'Pack Premium');
// Succès ✅

// Peut supprimer un pack
const { data } = await supabase
  .from('pack')
  .delete()
  .eq('id', 'uuid-du-pack');
// Succès ✅
```

## 🔍 Vérification des policies

### Voir toutes les policies de la table pack
```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'pack';
```

### Tester les policies

**Test 1 : Lecture publique**
```sql
-- Se déconnecter ou utiliser un utilisateur non admin
SET ROLE anon;
SELECT * FROM pack;
-- Doit retourner uniquement les packs avec disponible = true
```

**Test 2 : Admin peut tout faire**
```sql
-- Se connecter en tant qu'admin
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'uuid-admin';

-- Lire tous les packs
SELECT * FROM pack;

-- Insérer un pack
INSERT INTO pack (name, price) VALUES ('Pack Test', 3000);

-- Modifier un pack
UPDATE pack SET price = 3500 WHERE name = 'Pack Test';

-- Supprimer un pack
DELETE FROM pack WHERE name = 'Pack Test';
```

## 🚨 Sécurité

### Points importants

1. **RLS activé** : `ALTER TABLE pack ENABLE ROW LEVEL SECURITY;`
   - Sans cela, les policies ne s'appliquent pas

2. **Vérification du rôle admin** : 
   ```sql
   EXISTS (
     SELECT 1 FROM users
     WHERE users.id = auth.uid()
     AND users.role = 'admin'
   )
   ```
   - Vérifie que l'utilisateur est bien admin dans la table `users`

3. **Lecture publique limitée** :
   - Seuls les packs `disponible = true` sont visibles publiquement
   - Les packs désactivés sont invisibles pour les non-admins

## 🔧 Maintenance

### Désactiver temporairement RLS (pour debug)
```sql
ALTER TABLE pack DISABLE ROW LEVEL SECURITY;
```

### Réactiver RLS
```sql
ALTER TABLE pack ENABLE ROW LEVEL SECURITY;
```

### Supprimer une policy
```sql
DROP POLICY "Nom de la policy" ON pack;
```

### Modifier une policy
```sql
-- Supprimer l'ancienne
DROP POLICY "Nom de la policy" ON pack;

-- Créer la nouvelle
CREATE POLICY "Nom de la policy"
  ON pack
  FOR SELECT
  USING (nouvelle_condition);
```

## 📝 Notes importantes

1. **Table `users` requise** : Les policies vérifient le rôle dans la table `users`
2. **Fonction `auth.uid()`** : Retourne l'UUID de l'utilisateur connecté
3. **Cascade** : Si vous supprimez un pack, vérifiez qu'aucun repas ne l'utilise
4. **Performance** : Les index sur `disponible` et `ordre` optimisent les requêtes

## ✅ Avantages

- 🔒 **Sécurité renforcée** : Seuls les admins peuvent gérer les packs
- 👁️ **Visibilité contrôlée** : Les utilisateurs voient uniquement les packs disponibles
- 🛡️ **Protection des données** : Impossible de modifier/supprimer sans être admin
- 📊 **Audit** : Toutes les actions sont tracées via Supabase

## 🆘 Dépannage

### Problème : "RLS policy violation"
**Cause** : L'utilisateur n'a pas les permissions nécessaires  
**Solution** : Vérifier que l'utilisateur est bien admin dans la table `users`

### Problème : Aucun pack visible
**Cause** : Tous les packs sont `disponible = false`  
**Solution** : Activer au moins un pack ou se connecter en tant qu'admin

### Problème : Admin ne peut pas modifier
**Cause** : Le rôle n'est pas correctement défini  
**Solution** : Vérifier `SELECT role FROM users WHERE id = auth.uid()`

---

**🔐 Sécurité implémentée avec succès !**
