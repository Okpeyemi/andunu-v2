# Système de Packs pour les Repas

## Vue d'ensemble

Ce système permet de gérer les prix des repas via des **packs prédéfinis** au lieu de saisir manuellement les prix. Les administrateurs peuvent sélectionner un ou plusieurs packs lors de l'ajout/modification d'un repas.

## Structure de la base de données

### Table `pack`
```sql
CREATE TABLE pack (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  description TEXT,
  disponible BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Packs par défaut
- **Pack Standard** : 1000 FCFA - Prix de base pour un repas standard
- **Pack Medium** : 1500 FCFA - Prix pour un repas avec portion moyenne
- **Pack Premium** : 2000 FCFA - Prix pour un repas avec grande portion

### Modification de la table `repas`
```sql
ALTER TABLE repas ADD COLUMN pack_ids UUID[] DEFAULT '{}';
```

## Types TypeScript

### Interface Pack
```typescript
export interface Pack {
  id: string;
  name: string;
  price: number;
  description?: string;
  disponible: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
}
```

### Interface Repas (mise à jour)
```typescript
export interface Repas {
  id: string;
  name: string;
  prices: number[];      // Calculé à partir des packs
  pack_ids?: string[];   // IDs des packs sélectionnés
  disponible: boolean;
  created_at: string;
  updated_at: string;
}
```

## Fonctionnalités

### 1. Sélection des packs
- Interface avec checkboxes pour sélectionner un ou plusieurs packs
- Affichage du nom, prix et description de chaque pack
- Compteur de packs sélectionnés

### 2. Calcul automatique des prix
Lorsqu'un repas est créé/modifié :
```typescript
const prices = selectedPackIds
  .map(packId => packs.find(p => p.id === packId)?.price)
  .filter((price): price is number => price !== undefined)
  .sort((a, b) => a - b);
```

### 3. Affichage des prix
Les prix sont affichés sous forme de badges dans la liste des repas :
```
[1000 FCFA] [1500 FCFA] [2000 FCFA]
```

## Installation

### Étape 1 : Exécuter la migration SQL

**Option A : Via Supabase SQL Editor (RECOMMANDÉ)**
1. Ouvrez votre dashboard Supabase
2. Allez dans SQL Editor
3. Copiez le contenu de `scripts/create-pack-table.sql`
4. Exécutez la requête

**Option B : Via le script TypeScript**
```bash
npx tsx scripts/run-create-pack.ts
```

### Étape 2 : Vérifier l'installation

Le script affichera les packs disponibles :
```
✅ Packs trouvés dans la base de données:
┌─────────┬──────────────────┬──────────────┬─────────────────────────────────────┬─────────────┐
│ Nom     │ Prix             │ Description  │ Disponible                          │
├─────────┼──────────────────┼──────────────┼─────────────────────────────────────┼─────────────┤
│ Pack... │ 1,000 FCFA       │ Prix de base...│ Oui                               │
└─────────┴──────────────────┴──────────────┴─────────────────────────────────────┴─────────────┘
```

## Utilisation

### Ajouter un repas
1. Cliquez sur "Ajouter un repas"
2. Entrez le nom du repas
3. Sélectionnez un ou plusieurs packs
4. Cochez "Disponible" si nécessaire
5. Cliquez sur "Ajouter"

### Modifier un repas
1. Cliquez sur "Modifier" dans la ligne du repas
2. Les packs actuellement sélectionnés seront cochés
3. Modifiez la sélection des packs
4. Cliquez sur "Modifier"

### Exemple de repas
```
Nom: Riz sauce poisson
Packs sélectionnés: Pack Standard, Pack Premium
Prix affichés: [1000 FCFA] [2000 FCFA]
```

## Gestion des packs

Pour ajouter/modifier/supprimer des packs, vous devez :
1. Accéder à la table `pack` dans Supabase
2. Utiliser l'interface Table Editor
3. Ou créer une page d'administration dédiée

### Ajouter un nouveau pack (SQL)
```sql
INSERT INTO pack (name, price, description, ordre, disponible)
VALUES ('Pack XL', 2500, 'Prix pour une très grande portion', 4, true);
```

### Modifier un pack existant
```sql
UPDATE pack
SET price = 1200, description = 'Nouvelle description'
WHERE name = 'Pack Standard';
```

### Désactiver un pack
```sql
UPDATE pack
SET disponible = false
WHERE name = 'Pack Premium';
```

## Avantages du système

✅ **Centralisation** : Les prix sont gérés dans une seule table
✅ **Cohérence** : Tous les repas utilisent les mêmes packs
✅ **Flexibilité** : Facile d'ajouter/modifier des packs
✅ **Maintenance** : Changement de prix global en un seul endroit
✅ **UX améliorée** : Sélection visuelle au lieu de saisie manuelle

## Fichiers modifiés

### Nouveaux fichiers
- `scripts/create-pack-table.sql` - Migration SQL
- `scripts/run-create-pack.ts` - Script de vérification
- `PACKS_SYSTEM.md` - Cette documentation

### Fichiers modifiés
- `lib/supabase.ts` - Ajout de l'interface Pack
- `app/meals/page.tsx` - Intégration du système de packs

## Migration des données existantes

Les repas existants conservent leur champ `prices[]`. Pour les migrer vers le système de packs :

```sql
-- Exemple : Associer automatiquement les packs aux repas existants
UPDATE repas
SET pack_ids = ARRAY(
  SELECT id FROM pack 
  WHERE price = ANY(repas.prices)
  ORDER BY price
)
WHERE pack_ids IS NULL OR pack_ids = '{}';
```

## Support

En cas de problème :
1. Vérifiez que la table `pack` existe
2. Vérifiez que des packs sont disponibles (`disponible = true`)
3. Consultez les logs de la console navigateur
4. Vérifiez les logs Supabase

## Évolutions futures

- 🔄 Page d'administration des packs
- 📊 Statistiques d'utilisation des packs
- 🎨 Personnalisation des couleurs des packs
- 💰 Gestion des promotions par pack
