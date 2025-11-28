-- Migration: Ajouter la relation vendeurs-commandes
-- Objectif: Permettre d'associer chaque commande à un vendeur

-- ========================================
-- ÉTAPE 1: Ajouter la colonne vendeur_id
-- ========================================

-- Ajouter la colonne vendeur_id (nullable pour les commandes existantes)
ALTER TABLE commandes 
ADD COLUMN IF NOT EXISTS vendeur_id UUID REFERENCES vendeurs(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_commandes_vendeur_id ON commandes(vendeur_id);

-- ========================================
-- ÉTAPE 2: Ajouter un commentaire
-- ========================================

COMMENT ON COLUMN commandes.vendeur_id IS 'ID du vendeur assigné à cette commande';

-- ========================================
-- ÉTAPE 3: Vérification
-- ========================================

-- Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'commandes'
  AND column_name = 'vendeur_id';

-- Vérifier les contraintes de clé étrangère
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'commandes'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'vendeur_id';
