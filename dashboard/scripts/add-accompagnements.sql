-- Script pour ajouter les accompagnements standards
-- À exécuter dans Supabase SQL Editor ou via un script TypeScript

INSERT INTO accompagnements (name, price, description, disponible) VALUES
  ('Frite', 300, 'Frites croustillantes', true),
  ('Alloco', 400, 'Banane plantain frite', true),
  ('Aileron', 500, 'Aileron de poulet grillé', true),
  ('Poulet', 800, 'Morceau de poulet grillé', true),
  ('Poisson', 1000, 'Poisson grillé ou frit', true),
  ('Fromage', 350, 'Portion de fromage', true),
  ('Oeuf', 200, 'Oeuf dur ou au plat', true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  disponible = EXCLUDED.disponible,
  updated_at = NOW();

-- Vérifier les accompagnements ajoutés
SELECT * FROM accompagnements ORDER BY name;
