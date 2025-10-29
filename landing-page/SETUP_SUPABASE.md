# Configuration Supabase pour les Commandes

## Étape 1 : Créer la table `commandes`

1. Va sur ton dashboard Supabase : https://supabase.com/dashboard
2. Sélectionne ton projet
3. Va dans **SQL Editor** (icône de base de données dans le menu latéral)
4. Clique sur **New Query**
5. Copie et colle le contenu du fichier `supabase/migrations/create_commandes_table.sql`
6. Clique sur **Run** (ou Ctrl+Enter)

## Étape 2 : Vérifier que la table a été créée

Exécute cette requête dans le SQL Editor :

```sql
SELECT * FROM public.commandes LIMIT 1;
```

Si tu vois "No rows returned", c'est normal ! La table est créée mais vide.

## Étape 3 : Vérifier les variables d'environnement

Assure-toi que ton fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton-anon-key
```

Tu peux trouver ces valeurs dans :
- Dashboard Supabase → Settings → API

## Étape 4 : Tester

1. Redémarre ton serveur de développement
2. Va sur `/planifier`
3. Complète toutes les étapes
4. Essaye de passer au paiement
5. Vérifie la console du navigateur pour voir les détails de l'erreur si elle persiste

## Problèmes courants

### Erreur : "relation 'public.commandes' does not exist"
→ La table n'a pas été créée. Retourne à l'Étape 1.

### Erreur : "permission denied for table commandes"
→ Les politiques RLS sont trop restrictives. Exécute :

```sql
-- Politique temporaire pour le développement (à ajuster en production)
DROP POLICY IF EXISTS "Permettre création commande" ON public.commandes;
DROP POLICY IF EXISTS "Permettre lecture commande par téléphone" ON public.commandes;
DROP POLICY IF EXISTS "Permettre mise à jour commande" ON public.commandes;

CREATE POLICY "Permettre toutes opérations" ON public.commandes
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Erreur : "column 'xxx' does not exist"
→ Vérifie que tous les champs dans `CreateCommandeInput` correspondent aux colonnes de la table.

## Structure de la table

La table `commandes` contient :
- `id` (UUID, clé primaire)
- `client_nom` (VARCHAR)
- `client_telephone` (VARCHAR)
- `adresse_livraison` (TEXT)
- `heure_livraison` (VARCHAR)
- `jours_selectionnes` (TEXT[])
- `repas` (JSONB)
- `mode_paiement` (VARCHAR)
- `montant_total` (INTEGER)
- `transaction_id` (VARCHAR, nullable)
- `statut_paiement` (VARCHAR, default: 'pending')
- `statut` (VARCHAR, default: 'en_attente')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
