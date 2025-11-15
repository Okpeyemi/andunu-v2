-- Script de création des tables pour la gestion des vendeurs
-- Créé le: 2025-11-15

-- Étape 1: Créer la table vendeurs
CREATE TABLE IF NOT EXISTS vendeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_complet TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étape 2: Créer la table de liaison vendeur_repas (many-to-many)
CREATE TABLE IF NOT EXISTS vendeur_repas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_id UUID NOT NULL REFERENCES vendeurs(id) ON DELETE CASCADE,
  repas_id UUID NOT NULL REFERENCES repas(id) ON DELETE CASCADE,
  prix_vendeur INTEGER, -- Prix spécifique du vendeur pour ce repas (optionnel)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE(vendeur_id, repas_id)
);

-- Étape 3: Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_vendeurs_nom_complet ON vendeurs(nom_complet);
CREATE INDEX IF NOT EXISTS idx_vendeurs_actif ON vendeurs(actif);
CREATE INDEX IF NOT EXISTS idx_vendeur_repas_vendeur_id ON vendeur_repas(vendeur_id);
CREATE INDEX IF NOT EXISTS idx_vendeur_repas_repas_id ON vendeur_repas(repas_id);

-- Étape 4: Créer le trigger pour updated_at sur vendeurs
DROP TRIGGER IF EXISTS update_vendeurs_updated_at ON vendeurs;
CREATE TRIGGER update_vendeurs_updated_at
    BEFORE UPDATE ON vendeurs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5: Activer Row Level Security (RLS)
ALTER TABLE vendeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendeur_repas ENABLE ROW LEVEL SECURITY;

-- Étape 6: Créer les policies RLS pour vendeurs
-- Lecture publique des vendeurs actifs
CREATE POLICY "Lecture publique des vendeurs actifs"
  ON vendeurs
  FOR SELECT
  USING (actif = true);

-- Les administrateurs peuvent tout lire
CREATE POLICY "Admins peuvent tout lire vendeurs"
  ON vendeurs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Les administrateurs peuvent insérer
CREATE POLICY "Admins peuvent insérer vendeurs"
  ON vendeurs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Les administrateurs peuvent modifier
CREATE POLICY "Admins peuvent modifier vendeurs"
  ON vendeurs
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Les administrateurs peuvent supprimer
CREATE POLICY "Admins peuvent supprimer vendeurs"
  ON vendeurs
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Étape 7: Créer les policies RLS pour vendeur_repas
-- Lecture publique (pour afficher les plats des vendeurs)
CREATE POLICY "Lecture publique vendeur_repas"
  ON vendeur_repas
  FOR SELECT
  USING (true);

-- Les administrateurs peuvent tout faire
CREATE POLICY "Admins peuvent tout faire vendeur_repas"
  ON vendeur_repas
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Étape 8: Insérer des données d'exemple
INSERT INTO vendeurs (nom_complet, telephone, email, adresse, actif) VALUES
  ('Marie Kouassi', '+229 97 12 34 56', 'marie.kouassi@example.com', 'Cotonou, Quartier Fidjrossè', true),
  ('Jean Baptiste Togo', '+229 96 87 65 43', 'jean.togo@example.com', 'Porto-Novo, Centre-ville', true),
  ('Fatou Diallo', '+229 95 11 22 33', 'fatou.diallo@example.com', 'Parakou, Quartier Banikoara', true)
ON CONFLICT (id) DO NOTHING;

-- Associer quelques repas aux vendeurs (en utilisant les IDs des repas existants)
-- Note: Ces insertions peuvent échouer si les repas n'existent pas encore
DO $$
DECLARE
  marie_id UUID;
  jean_id UUID;
  fatou_id UUID;
  riz_poisson_id UUID;
  riz_arachide_id UUID;
  pates_tomate_id UUID;
BEGIN
  -- Récupérer les IDs des vendeurs
  SELECT id INTO marie_id FROM vendeurs WHERE nom_complet = 'Marie Kouassi' LIMIT 1;
  SELECT id INTO jean_id FROM vendeurs WHERE nom_complet = 'Jean Baptiste Togo' LIMIT 1;
  SELECT id INTO fatou_id FROM vendeurs WHERE nom_complet = 'Fatou Diallo' LIMIT 1;
  
  -- Récupérer les IDs des repas
  SELECT id INTO riz_poisson_id FROM repas WHERE name = 'Riz sauce poisson' LIMIT 1;
  SELECT id INTO riz_arachide_id FROM repas WHERE name = 'Riz sauce arachide' LIMIT 1;
  SELECT id INTO pates_tomate_id FROM repas WHERE name = 'Pâtes sauce tomate' LIMIT 1;
  
  -- Associer les repas aux vendeurs si les IDs existent
  IF marie_id IS NOT NULL AND riz_poisson_id IS NOT NULL THEN
    INSERT INTO vendeur_repas (vendeur_id, repas_id) VALUES (marie_id, riz_poisson_id) ON CONFLICT DO NOTHING;
  END IF;
  
  IF marie_id IS NOT NULL AND riz_arachide_id IS NOT NULL THEN
    INSERT INTO vendeur_repas (vendeur_id, repas_id) VALUES (marie_id, riz_arachide_id) ON CONFLICT DO NOTHING;
  END IF;
  
  IF jean_id IS NOT NULL AND pates_tomate_id IS NOT NULL THEN
    INSERT INTO vendeur_repas (vendeur_id, repas_id) VALUES (jean_id, pates_tomate_id) ON CONFLICT DO NOTHING;
  END IF;
  
  IF jean_id IS NOT NULL AND riz_poisson_id IS NOT NULL THEN
    INSERT INTO vendeur_repas (vendeur_id, repas_id) VALUES (jean_id, riz_poisson_id) ON CONFLICT DO NOTHING;
  END IF;
  
  IF fatou_id IS NOT NULL AND riz_arachide_id IS NOT NULL THEN
    INSERT INTO vendeur_repas (vendeur_id, repas_id) VALUES (fatou_id, riz_arachide_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Étape 9: Vérifications
-- Vérifier les tables créées
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename IN ('vendeurs', 'vendeur_repas');

-- Vérifier les policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('vendeurs', 'vendeur_repas')
ORDER BY tablename, cmd, policyname;

-- Test de lecture
SELECT 
  v.nom_complet,
  COUNT(vr.repas_id) as nombre_repas
FROM vendeurs v
LEFT JOIN vendeur_repas vr ON v.id = vr.vendeur_id
WHERE v.actif = true
GROUP BY v.id, v.nom_complet
ORDER BY v.nom_complet;
