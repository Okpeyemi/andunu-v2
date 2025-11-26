-- Script pour ajouter les repas et leurs associations avec tous les accompagnements
-- À exécuter après avoir ajouté les accompagnements

-- ========================================
-- ÉTAPE 1: Ajouter les repas
-- ========================================

INSERT INTO repas (name, prices, disponible) VALUES
  ('Atassi', ARRAY[400], true),
  ('Atieke', ARRAY[400], true),
  ('Telibo', ARRAY[400], true),
  ('Riz créole', ARRAY[400], true),
  ('Agoun', ARRAY[400], true)
ON CONFLICT (name) DO UPDATE SET
  prices = EXCLUDED.prices,
  disponible = EXCLUDED.disponible,
  updated_at = NOW();

-- ========================================
-- ÉTAPE 2: Créer les associations repas-accompagnements
-- ========================================

-- Associer chaque repas à tous les accompagnements
INSERT INTO repas_accompagnements (repas_id, accompagnement_id)
SELECT 
  r.id AS repas_id,
  a.id AS accompagnement_id
FROM repas r
CROSS JOIN accompagnements a
WHERE r.name IN ('Atassi', 'Atieke', 'Telibo', 'Riz créole', 'Agoun')
  AND a.name IN ('Frite', 'Alloco', 'Aileron', 'Poulet', 'Poisson', 'Fromage', 'Oeuf')
ON CONFLICT (repas_id, accompagnement_id) DO NOTHING;

-- ========================================
-- ÉTAPE 3: Vérification
-- ========================================

-- Afficher les repas ajoutés
SELECT 
  id,
  name,
  prices,
  disponible,
  created_at
FROM repas
WHERE name IN ('Atassi', 'Atieke', 'Telibo', 'Riz créole', 'Agoun')
ORDER BY name;

-- Compter les associations par repas
SELECT 
  r.name AS repas,
  COUNT(ra.accompagnement_id) AS nb_accompagnements
FROM repas r
LEFT JOIN repas_accompagnements ra ON r.id = ra.repas_id
WHERE r.name IN ('Atassi', 'Atieke', 'Telibo', 'Riz créole', 'Agoun')
GROUP BY r.id, r.name
ORDER BY r.name;

-- Afficher le détail des associations pour un repas (exemple: Atassi)
SELECT 
  r.name AS repas,
  a.name AS accompagnement,
  a.price AS prix_accompagnement
FROM repas r
JOIN repas_accompagnements ra ON r.id = ra.repas_id
JOIN accompagnements a ON ra.accompagnement_id = a.id
WHERE r.name = 'Atassi'
ORDER BY a.name;
