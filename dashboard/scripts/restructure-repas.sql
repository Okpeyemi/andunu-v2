-- Migration pour restructurer la table repas
-- Nouvelle structure: { name: string, prices: number[] }

-- Étape 1: Créer une nouvelle table repas avec la nouvelle structure
DROP TABLE IF EXISTS repas_new CASCADE;
CREATE TABLE repas_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  prices INTEGER[] NOT NULL DEFAULT '{}',
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étape 2: Migrer les données existantes (si nécessaire)
-- Convertir l'ancien format vers le nouveau
INSERT INTO repas_new (id, name, prices, disponible, created_at, updated_at)
SELECT 
  id,
  nom as name,
  ARRAY[prix] as prices, -- Convertir le prix unique en tableau
  disponible,
  created_at,
  updated_at
FROM repas;

-- Étape 3: Supprimer l'ancienne table et renommer la nouvelle
DROP TABLE IF EXISTS repas CASCADE;
ALTER TABLE repas_new RENAME TO repas;

-- Étape 4: Supprimer la table accompagnements (plus nécessaire)
DROP TABLE IF EXISTS accompagnements CASCADE;

-- Étape 5: Créer un index sur le nom pour les recherches
CREATE INDEX idx_repas_name ON repas(name);

-- Étape 6: Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Étape 7: Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_repas_updated_at ON repas;
CREATE TRIGGER update_repas_updated_at
    BEFORE UPDATE ON repas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 8: Insérer des données d'exemple
INSERT INTO repas (name, prices, disponible) VALUES
  ('Riz sauce poisson', ARRAY[1000, 1500], true),
  ('Riz sauce arachide', ARRAY[1000, 1500], true),
  ('Riz sauce tomate', ARRAY[1000, 1500], true),
  ('Pâtes sauce tomate', ARRAY[1200, 1700], true),
  ('Attiéké poisson', ARRAY[1500, 2000], true)
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT * FROM repas;
