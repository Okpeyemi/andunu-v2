# Migration de la structure des repas

## Résumé des changements

Cette migration restructure complètement le système de repas pour simplifier la gestion :

### Ancienne structure
```typescript
interface Repas {
  id: string;
  nom: string;
  description?: string;
  prix: number;
  image_url?: string;
  accompagnements_disponibles: string[];
  disponible: boolean;
}

interface Accompagnement {
  id: string;
  nom: string;
  description?: string;
  prix: number;
  disponible: boolean;
}
```

### Nouvelle structure
```typescript
interface Repas {
  id: string;
  name: string;
  prices: number[]; // Ex: [1000, 1500]
  disponible: boolean;
  created_at: string;
  updated_at: string;
}
```

## Changements effectués

### 1. Base de données
- ✅ Restructuration de la table `repas` avec les champs `name` et `prices[]`
- ✅ Suppression de la table `accompagnements`
- ✅ Migration des données existantes
- ✅ Ajout de données d'exemple

### 2. Types TypeScript (`lib/supabase.ts`)
- ✅ Mise à jour de l'interface `Repas`
- ✅ Suppression de l'interface `Accompagnement`
- ✅ Mise à jour de `CreateRepasInput`
- ✅ Suppression de `CreateAccompagnementInput`
- ✅ Mise à jour de `LogEntityType` (suppression de 'accompaniment')

### 3. Interface utilisateur (`app/meals/page.tsx`)
- ✅ Refactorisation complète de la page
- ✅ Suppression de l'onglet "Accompagnements"
- ✅ Nouveau formulaire avec 2 champs de prix
- ✅ Ajout de la fonctionnalité d'édition
- ✅ Affichage des prix sous forme de badges
- ✅ Interface simplifiée et moderne

### 4. Logs (`app/logs/page.tsx`)
- ✅ Suppression des références à 'accompaniment'

## Comment exécuter la migration

### Option 1 : Via le script TypeScript
```bash
cd /home/darellchooks/Bureau/andunu-v2/dashboard
npx tsx scripts/run-restructure-repas.ts
```

### Option 2 : Directement dans Supabase SQL Editor
1. Ouvrir le SQL Editor dans votre dashboard Supabase
2. Copier le contenu de `scripts/restructure-repas.sql`
3. Exécuter la requête

## Exemples de données

Après la migration, vous aurez des repas comme :
- Riz sauce poisson : [1000, 1500] FCFA
- Riz sauce arachide : [1000, 1500] FCFA
- Riz sauce tomate : [1000, 1500] FCFA
- Pâtes sauce tomate : [1200, 1700] FCFA
- Attiéké poisson : [1500, 2000] FCFA

## Notes importantes

⚠️ **Cette migration est irréversible !**
- Toutes les données d'accompagnements seront supprimées
- Les anciennes données de repas seront converties (un seul prix devient un tableau avec un élément)
- Assurez-vous d'avoir une sauvegarde avant d'exécuter

## Vérification post-migration

Après la migration, vérifiez :
1. ✅ La page `/meals` s'affiche correctement
2. ✅ Vous pouvez ajouter un nouveau repas avec 2 prix
3. ✅ Vous pouvez modifier un repas existant
4. ✅ Vous pouvez supprimer un repas
5. ✅ Le toggle disponible/indisponible fonctionne
6. ✅ Les logs ne montrent plus l'option "Accompagnement"

## Rollback (si nécessaire)

Si vous devez revenir en arrière, vous devrez :
1. Restaurer une sauvegarde de la base de données
2. Restaurer les anciens fichiers depuis le backup :
   - `app/meals/page.tsx.backup`
   - Révertir les changements dans `lib/supabase.ts`

## Support

En cas de problème, vérifiez :
- Les logs de la console du navigateur
- Les logs Supabase
- Le fichier `scripts/restructure-repas.sql` pour les détails de la migration
