-- Création de la table pack pour gérer les prix prédéfinis
-- Cette table contient les différents packs de prix disponibles

-- Étape 1: Créer la table pack
DROP TABLE IF EXISTS pack CASCADE;
CREATE TABLE pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- Ex: "Pack Standard", "Pack Premium"
  price INTEGER NOT NULL, -- Prix en FCFA
  description TEXT,
  disponible BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0, -- Pour l'ordre d'affichage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étape 2: Créer un index sur le prix et l'ordre
CREATE INDEX idx_pack_price ON pack(price);
CREATE INDEX idx_pack_ordre ON pack(ordre);

-- Étape 3: Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_pack_updated_at ON pack;
CREATE TRIGGER update_pack_updated_at
    BEFORE UPDATE ON pack
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 4: Insérer les packs par défaut
INSERT INTO pack (name, price, description, ordre, disponible) VALUES
  ('Pack Standard', 1000, 'Prix de base pour un repas standard', 1, true),
  ('Pack Medium', 1500, 'Prix pour un repas avec portion moyenne', 2, true),
  ('Pack Premium', 2000, 'Prix pour un repas avec grande portion', 3, true)
ON CONFLICT (name) DO NOTHING;

-- Étape 5: Modifier la table repas pour stocker les IDs des packs au lieu des prix bruts
-- On garde prices[] pour la compatibilité, mais on ajoute pack_ids[]
ALTER TABLE repas ADD COLUMN IF NOT EXISTS pack_ids UUID[] DEFAULT '{}';

-- Créer un index sur pack_ids
CREATE INDEX IF NOT EXISTS idx_repas_pack_ids ON repas USING GIN(pack_ids);

-- Étape 6: Créer une fonction pour vérifier le rôle admin (évite la récursion RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Étape 7: Activer Row Level Security (RLS) sur la table pack
ALTER TABLE pack ENABLE ROW LEVEL SECURITY;

-- Étape 8: Créer les policies RLS pour la table pack

-- Policy 1: Tout le monde peut lire les packs disponibles (pour l'affichage public)
DROP POLICY IF EXISTS "Lecture publique des packs disponibles" ON pack;
CREATE POLICY "Lecture publique des packs disponibles"
  ON pack
  FOR SELECT
  USING (disponible = true);

-- Policy 2: Les administrateurs peuvent tout lire
DROP POLICY IF EXISTS "Admins peuvent tout lire" ON pack;
CREATE POLICY "Admins peuvent tout lire"
  ON pack
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 3: Les administrateurs peuvent insérer
DROP POLICY IF EXISTS "Admins peuvent insérer" ON pack;
CREATE POLICY "Admins peuvent insérer"
  ON pack
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy 4: Les administrateurs peuvent modifier
DROP POLICY IF EXISTS "Admins peuvent modifier" ON pack;
CREATE POLICY "Admins peuvent modifier"
  ON pack
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 5: Les administrateurs peuvent supprimer
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON pack;
CREATE POLICY "Admins peuvent supprimer"
  ON pack
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Vérification des policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'pack';

-- Vérification des packs
SELECT * FROM pack ORDER BY ordre;
