-- Migration: Supprimer la table pack et créer le système d'accompagnements
-- Objectif: Remplacer le système de packs par un système d'accompagnements avec relation many-to-many

-- ========================================
-- ÉTAPE 1: Supprimer la table pack
-- ========================================

-- 1.1: Supprimer toutes les policies RLS de la table pack
DROP POLICY IF EXISTS "Lecture publique des packs disponibles" ON pack;
DROP POLICY IF EXISTS "Admins peuvent tout lire" ON pack;
DROP POLICY IF EXISTS "Admins peuvent insérer" ON pack;
DROP POLICY IF EXISTS "Admins peuvent modifier" ON pack;
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON pack;

-- 1.2: Supprimer la colonne pack_ids de la table repas
ALTER TABLE repas DROP COLUMN IF EXISTS pack_ids;

-- 1.3: Supprimer la table pack
DROP TABLE IF EXISTS pack CASCADE;

-- ========================================
-- ÉTAPE 2: Créer la table accompagnements
-- ========================================

CREATE TABLE accompagnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL, -- Prix en FCFA
  description TEXT,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur le nom pour les recherches
CREATE INDEX idx_accompagnements_name ON accompagnements(name);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_accompagnements_updated_at ON accompagnements;
CREATE TRIGGER update_accompagnements_updated_at
    BEFORE UPDATE ON accompagnements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ÉTAPE 3: Créer la table de jonction repas_accompagnements
-- ========================================

CREATE TABLE repas_accompagnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repas_id UUID NOT NULL REFERENCES repas(id) ON DELETE CASCADE,
  accompagnement_id UUID NOT NULL REFERENCES accompagnements(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Contrainte unique pour éviter les doublons
  UNIQUE(repas_id, accompagnement_id)
);

-- Index pour les recherches
CREATE INDEX idx_repas_accompagnements_repas ON repas_accompagnements(repas_id);
CREATE INDEX idx_repas_accompagnements_accompagnement ON repas_accompagnements(accompagnement_id);

-- ========================================
-- ÉTAPE 4: Configurer Row Level Security (RLS)
-- ========================================

-- 4.1: Activer RLS sur accompagnements
ALTER TABLE accompagnements ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les accompagnements disponibles
DROP POLICY IF EXISTS "Lecture publique des accompagnements disponibles" ON accompagnements;
CREATE POLICY "Lecture publique des accompagnements disponibles"
  ON accompagnements
  FOR SELECT
  USING (disponible = true);

-- Policy: Les admins peuvent tout lire
DROP POLICY IF EXISTS "Admins peuvent tout lire" ON accompagnements;
CREATE POLICY "Admins peuvent tout lire"
  ON accompagnements
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Les admins peuvent insérer
DROP POLICY IF EXISTS "Admins peuvent insérer" ON accompagnements;
CREATE POLICY "Admins peuvent insérer"
  ON accompagnements
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Les admins peuvent modifier
DROP POLICY IF EXISTS "Admins peuvent modifier" ON accompagnements;
CREATE POLICY "Admins peuvent modifier"
  ON accompagnements
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Les admins peuvent supprimer
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON accompagnements;
CREATE POLICY "Admins peuvent supprimer"
  ON accompagnements
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- 4.2: Activer RLS sur repas_accompagnements
ALTER TABLE repas_accompagnements ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les liaisons
DROP POLICY IF EXISTS "Lecture publique des liaisons" ON repas_accompagnements;
CREATE POLICY "Lecture publique des liaisons"
  ON repas_accompagnements
  FOR SELECT
  USING (true);

-- Policy: Les admins peuvent insérer
DROP POLICY IF EXISTS "Admins peuvent insérer" ON repas_accompagnements;
CREATE POLICY "Admins peuvent insérer"
  ON repas_accompagnements
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Les admins peuvent supprimer
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON repas_accompagnements;
CREATE POLICY "Admins peuvent supprimer"
  ON repas_accompagnements
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ========================================
-- ÉTAPE 5: Insérer des données d'exemple
-- ========================================

INSERT INTO accompagnements (name, price, description, disponible) VALUES
  ('Salade verte', 500, 'Salade fraîche de saison', true),
  ('Frites', 300, 'Frites croustillantes', true),
  ('Banane plantain frite', 400, 'Alloco croustillant', true),
  ('Légumes sautés', 600, 'Mélange de légumes frais', true),
  ('Avocat', 350, 'Demi-avocat frais', true)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- ÉTAPE 6: Vérifications
-- ========================================

-- Vérifier que la table pack n'existe plus
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pack'
) as pack_exists;

-- Vérifier les nouvelles tables
SELECT * FROM accompagnements ORDER BY name;

-- Vérifier les policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('accompagnements', 'repas_accompagnements')
ORDER BY tablename, policyname;
