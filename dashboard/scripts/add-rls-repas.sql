-- Ajout de Row Level Security (RLS) sur la table repas
-- Utilise la même fonction is_admin() que pour la table pack

-- Étape 1: Vérifier/Créer la fonction is_admin() si elle n'existe pas
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
    AND role = 'super_admin'
  );
END;
$$;

-- Étape 2: Activer Row Level Security (RLS) sur la table repas
ALTER TABLE repas ENABLE ROW LEVEL SECURITY;

-- Étape 3: Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Lecture publique des repas disponibles" ON repas;
DROP POLICY IF EXISTS "Admins peuvent tout lire repas" ON repas;
DROP POLICY IF EXISTS "Admins peuvent insérer repas" ON repas;
DROP POLICY IF EXISTS "Admins peuvent modifier repas" ON repas;
DROP POLICY IF EXISTS "Admins peuvent supprimer repas" ON repas;

-- Étape 4: Créer les policies RLS pour la table repas

-- Policy 1: Tout le monde peut lire les repas disponibles (pour l'affichage public)
CREATE POLICY "Lecture publique des repas disponibles"
  ON repas
  FOR SELECT
  USING (disponible = true);

-- Policy 2: Les administrateurs peuvent tout lire
CREATE POLICY "Admins peuvent tout lire repas"
  ON repas
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 3: Les administrateurs peuvent insérer
CREATE POLICY "Admins peuvent insérer repas"
  ON repas
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy 4: Les administrateurs peuvent modifier
CREATE POLICY "Admins peuvent modifier repas"
  ON repas
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 5: Les administrateurs peuvent supprimer
CREATE POLICY "Admins peuvent supprimer repas"
  ON repas
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Vérification des policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'repas'
ORDER BY cmd, policyname;

-- Vérification que RLS est activé
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename = 'repas';

-- Test de lecture
SELECT COUNT(*) as total_repas FROM repas;
