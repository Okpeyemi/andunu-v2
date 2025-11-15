# Module Vendeurs - Guide d'utilisation

## Vue d'ensemble

Le module Vendeurs permet de gérer les vendeurs et leurs plats dans l'application Andunu. Cette fonctionnalité inclut :

- ✅ Gestion complète des vendeurs (CRUD)
- ✅ Association des plats aux vendeurs
- ✅ Interface utilisateur intuitive
- ✅ Filtres et recherche
- ✅ Sécurité avec Row Level Security (RLS)

## Installation

### 1. Créer les tables en base de données

Exécutez le script SQL suivant dans votre base de données Supabase :

```bash
# Dans le dashboard Supabase, onglet SQL Editor
# Ou via CLI Supabase
supabase db push
```

Exécutez le fichier : `/scripts/create-vendeurs-tables.sql`

### 2. Vérification des permissions

Assurez-vous que la fonction `is_admin()` existe et que l'utilisateur connecté a le rôle `super_admin`.

## Structure de la base de données

### Table `vendeurs`
```sql
- id (UUID, PK)
- nom_complet (TEXT, NOT NULL)
- telephone (TEXT, nullable)
- email (TEXT, nullable) 
- adresse (TEXT, nullable)
- actif (BOOLEAN, default: true)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Table `vendeur_repas` (liaison many-to-many)
```sql
- id (UUID, PK)
- vendeur_id (UUID, FK -> vendeurs.id)
- repas_id (UUID, FK -> repas.id)
- prix_vendeur (INTEGER, nullable)
- created_at (TIMESTAMPTZ)
```

## Fonctionnalités

### 1. Page Vendeurs (`/vendeurs`)

**Affichage :**
- Liste de tous les vendeurs avec leurs informations
- Nombre de repas vendus par vendeur
- Statut (Actif/Inactif)
- Filtres par nom, téléphone, email et statut

**Actions disponibles :**
- ➕ **Ajouter un vendeur** : Bouton en haut à droite
- 🍽️ **Gérer repas** : Associer/dissocier des plats au vendeur
- 🔄 **Activer/Désactiver** : Changer le statut du vendeur

### 2. Ajout de vendeur

**Champs obligatoires :**
- Nom complet *

**Champs optionnels :**
- Téléphone
- Email (avec validation)
- Adresse

### 3. Gestion des repas

Pour chaque vendeur, vous pouvez :
- Sélectionner les plats qu'il vend depuis la liste des repas disponibles
- Voir les prix de chaque plat
- Sauvegarder les associations

## Types TypeScript

Les types suivants ont été ajoutés dans `/lib/supabase.ts` :

```typescript
// Vendeur de base
interface Vendeur {
  id: string;
  nom_complet: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

// Pour la création
interface CreateVendeurInput {
  nom_complet: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  actif?: boolean;
}

// Vendeur avec ses repas (pour l'affichage)
interface VendeurAvecRepas extends Vendeur {
  repas: Array<{
    id: string;
    name: string;
    prices: number[];
    prix_vendeur?: number;
  }>;
}
```

## Navigation

Le lien "Vendeurs" a été ajouté dans la sidebar entre "Repas" et "Rapports".

## Sécurité (RLS)

**Policies créées :**

### Table `vendeurs`
- `Lecture publique des vendeurs actifs` : Tout le monde peut voir les vendeurs actifs
- `Admins peuvent tout lire vendeurs` : Les admins voient tous les vendeurs
- `Admins peuvent insérer/modifier/supprimer vendeurs` : Seuls les admins peuvent gérer

### Table `vendeur_repas`
- `Lecture publique vendeur_repas` : Tout le monde peut voir les associations
- `Admins peuvent tout faire vendeur_repas` : Seuls les admins peuvent modifier

## Données d'exemple

Le script crée automatiquement 3 vendeurs d'exemple :
1. **Marie Kouassi** - Cotonou, Fidjrossè
2. **Jean Baptiste Togo** - Porto-Novo, Centre-ville  
3. **Fatou Diallo** - Parakou, Banikoara

Avec des associations aux repas existants.

## API Usage

### Récupérer les vendeurs avec leurs repas
```typescript
const { data: vendeurs } = await supabase
  .from('vendeurs')
  .select(`
    *,
    vendeur_repas (
      repas_id,
      prix_vendeur,
      repas (
        id,
        name,
        prices
      )
    )
  `)
  .order('nom_complet');
```

### Créer un vendeur
```typescript
const { error } = await supabase
  .from('vendeurs')
  .insert([{
    nom_complet: 'Nouveau Vendeur',
    telephone: '+229 XX XX XX XX',
    email: 'vendeur@example.com',
    adresse: 'Adresse complète'
  }]);
```

### Associer des repas à un vendeur
```typescript
// Supprimer les anciennes associations
await supabase
  .from('vendeur_repas')
  .delete()
  .eq('vendeur_id', vendeurId);

// Ajouter les nouvelles
const insertData = repasIds.map(repasId => ({
  vendeur_id: vendeurId,
  repas_id: repasId
}));

await supabase
  .from('vendeur_repas')
  .insert(insertData);
```

## Prochaines améliorations possibles

- [ ] Gestion des prix spécifiques par vendeur
- [ ] Statistiques des ventes par vendeur
- [ ] Géolocalisation des vendeurs
- [ ] Photos des vendeurs
- [ ] Horaires d'ouverture
- [ ] Système de notation/avis

## Support

Pour toute question ou problème, consultez les logs dans `/logs` ou contactez l'équipe de développement.
