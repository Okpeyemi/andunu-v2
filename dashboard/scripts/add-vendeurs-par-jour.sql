-- Migration: Ajouter vendeurs par jour dans les commandes
-- Objectif: Stocker un vendeur différent pour chaque jour de la commande

-- ========================================
-- ÉTAPE 1: Ajouter la colonne vendeurs_par_jour
-- ========================================

-- Ajouter une colonne JSONB pour stocker les vendeurs par jour
ALTER TABLE commandes 
ADD COLUMN IF NOT EXISTS vendeurs_par_jour JSONB DEFAULT '{}'::jsonb;

-- ========================================
-- ÉTAPE 2: Commenter les colonnes
-- ========================================

COMMENT ON COLUMN commandes.vendeurs_par_jour IS 'Mapping JSON des vendeurs par jour: {"Lundi": "vendeur_id_1", "Mardi": "vendeur_id_2", ...}';
COMMENT ON COLUMN commandes.vendeur_id IS 'DÉPRÉCIÉ - Utiliser vendeurs_par_jour à la place';

-- ========================================
-- ÉTAPE 3: Créer un index GIN pour les requêtes JSON
-- ========================================

CREATE INDEX IF NOT EXISTS idx_commandes_vendeurs_par_jour ON commandes USING GIN (vendeurs_par_jour);

-- ========================================
-- ÉTAPE 4: Fonction helper pour obtenir les vendeurs uniques
-- ========================================

-- Fonction pour extraire tous les vendeurs uniques d'une commande
CREATE OR REPLACE FUNCTION get_vendeurs_from_commande(vendeurs_par_jour_data JSONB)
RETURNS TEXT[] AS $$
DECLARE
  vendeur_ids TEXT[];
BEGIN
  -- Extraire toutes les valeurs (vendeur IDs) du JSON
  SELECT ARRAY_AGG(DISTINCT value::text)
  INTO vendeur_ids
  FROM jsonb_each_text(vendeurs_par_jour_data)
  WHERE value IS NOT NULL AND value::text != '';
  
  RETURN COALESCE(vendeur_ids, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_vendeurs_from_commande IS 'Extrait un tableau de vendeur_ids uniques depuis vendeurs_par_jour';

-- ========================================
-- ÉTAPE 5: Vérification
-- ========================================

-- Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'commandes'
  AND column_name IN ('vendeurs_par_jour', 'vendeur_id')
ORDER BY column_name;

-- Vérifier les index
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'commandes'
  AND indexname LIKE '%vendeur%';
