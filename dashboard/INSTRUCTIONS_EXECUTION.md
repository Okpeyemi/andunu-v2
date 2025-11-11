# 🚀 Instructions d'Exécution - Système de Packs

## ⚡ Démarrage Rapide

### Étape 1 : Exécuter la migration SQL ⭐

**Ouvrez le fichier SQL :**
```bash
scripts/create-pack-table.sql
```

**Copiez tout le contenu et exécutez-le dans Supabase SQL Editor**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche
4. Cliquez sur "New query"
5. Collez le contenu de `create-pack-table.sql`
6. Cliquez sur "Run" (ou Ctrl+Enter)

### Étape 2 : Vérifier l'installation

```bash
npx tsx scripts/run-create-pack.ts
```

Vous devriez voir :
```
✅ Packs trouvés dans la base de données:
┌─────────────────┬──────────────┬─────────────────────────────────┬────────────┐
│ Nom             │ Prix         │ Description                     │ Disponible │
├─────────────────┼──────────────┼─────────────────────────────────┼────────────┤
│ Pack Standard   │ 1,000 FCFA   │ Prix de base...                 │ Oui        │
│ Pack Medium     │ 1,500 FCFA   │ Prix pour portion moyenne...    │ Oui        │
│ Pack Premium    │ 2,000 FCFA   │ Prix pour grande portion...     │ Oui        │
└─────────────────┴──────────────┴─────────────────────────────────┴────────────┘
```

### Étape 3 : Tester l'interface

```bash
npm run dev
```

Puis ouvrez : http://localhost:3000/meals

## ✅ Checklist de Test

### Test 1 : Affichage des packs
- [ ] La page `/meals` s'affiche sans erreur
- [ ] Le bouton "Ajouter un repas" est visible
- [ ] Cliquer sur "Ajouter un repas" ouvre le modal
- [ ] Le modal affiche 3 packs avec checkboxes
- [ ] Chaque pack affiche : nom, prix et description

### Test 2 : Ajout d'un repas
- [ ] Entrer "Riz sauce poisson" comme nom
- [ ] Cocher "Pack Standard" (1000 FCFA)
- [ ] Cocher "Pack Premium" (2000 FCFA)
- [ ] Cliquer sur "Ajouter"
- [ ] Le repas apparaît dans la liste
- [ ] Les prix affichés sont : [1000 FCFA] [2000 FCFA]

### Test 3 : Modification d'un repas
- [ ] Cliquer sur "Modifier" pour un repas existant
- [ ] Les packs actuels sont pré-cochés
- [ ] Décocher un pack
- [ ] Cocher un autre pack
- [ ] Cliquer sur "Modifier"
- [ ] Les prix sont mis à jour dans la liste

### Test 4 : Validation
- [ ] Essayer d'ajouter un repas sans nom → Erreur affichée
- [ ] Essayer d'ajouter un repas sans pack → Erreur affichée
- [ ] Les erreurs sont claires et compréhensibles

## 🐛 Dépannage

### Problème : "Table pack does not exist"
**Solution :** Vous n'avez pas exécuté la migration SQL
```bash
# Exécutez le fichier SQL dans Supabase SQL Editor
scripts/create-pack-table.sql
```

### Problème : "Aucun pack disponible"
**Solution :** Les packs ne sont pas insérés ou sont désactivés
```sql
-- Vérifier les packs
SELECT * FROM pack;

-- Activer tous les packs
UPDATE pack SET disponible = true;
```

### Problème : Erreur TypeScript
**Solution :** Vérifier que les types sont à jour
```bash
# Vérifier les erreurs
npx tsc --noEmit

# Si erreur, vérifier que lib/supabase.ts contient l'interface Pack
```

### Problème : Les prix ne s'affichent pas
**Solution :** Vérifier que `pack_ids` est bien sauvegardé
```sql
-- Vérifier un repas
SELECT name, prices, pack_ids FROM repas LIMIT 1;

-- Si pack_ids est vide, le repas a été créé avant la migration
-- Supprimer et recréer le repas via l'interface
```

## 📊 Vérifications SQL

### Vérifier que tout est en place
```sql
-- 1. Vérifier la table pack
SELECT COUNT(*) as nb_packs FROM pack;
-- Résultat attendu : 3

-- 2. Vérifier que la colonne pack_ids existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'repas' AND column_name = 'pack_ids';
-- Résultat attendu : pack_ids | ARRAY

-- 3. Vérifier les packs disponibles
SELECT name, price, disponible FROM pack ORDER BY ordre;
-- Résultat attendu : 3 lignes avec disponible = true

-- 4. Vérifier un repas avec packs
SELECT name, prices, pack_ids FROM repas LIMIT 1;
-- Résultat attendu : pack_ids contient des UUIDs
```

## 🔄 Migration des données existantes

Si vous avez des repas existants créés avant cette mise à jour :

```sql
-- Option 1 : Supprimer tous les anciens repas
TRUNCATE TABLE repas CASCADE;

-- Option 2 : Associer automatiquement les packs aux repas existants
UPDATE repas
SET pack_ids = ARRAY(
  SELECT id FROM pack 
  WHERE price = ANY(repas.prices)
  ORDER BY price
)
WHERE pack_ids IS NULL OR pack_ids = '{}';
```

## 📝 Commandes Utiles

### Voir tous les repas avec leurs packs
```sql
SELECT 
  r.name,
  r.prices,
  ARRAY(
    SELECT p.name 
    FROM pack p 
    WHERE p.id = ANY(r.pack_ids)
  ) as packs
FROM repas r
ORDER BY r.name;
```

### Ajouter un nouveau pack
```sql
INSERT INTO pack (name, price, description, ordre, disponible)
VALUES ('Pack XL', 2500, 'Prix pour portion extra large', 4, true);
```

### Modifier le prix d'un pack
```sql
UPDATE pack 
SET price = 1200 
WHERE name = 'Pack Standard';
```

### Désactiver un pack
```sql
UPDATE pack 
SET disponible = false 
WHERE name = 'Pack Premium';
```

## 🎯 Prochaines Étapes

Une fois que tout fonctionne :

1. **Tester en production** avec de vraies données
2. **Former les utilisateurs** sur la nouvelle interface
3. **Surveiller les logs** pour détecter d'éventuels problèmes
4. **(Optionnel)** Créer une page d'admin pour gérer les packs

## 📚 Documentation

- `PACKS_SYSTEM.md` - Documentation complète du système
- `STRUCTURE_FINALE.md` - Architecture et structure des données
- `RESUME_PACKS.md` - Résumé visuel de l'implémentation

## 🆘 Support

En cas de problème :
1. Vérifier les logs de la console navigateur (F12)
2. Vérifier les logs Supabase
3. Consulter la documentation ci-dessus
4. Vérifier que la migration SQL a bien été exécutée

---

**✅ Vous êtes prêt ! Exécutez la migration SQL et testez l'interface.**
