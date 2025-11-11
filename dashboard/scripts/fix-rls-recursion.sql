-- Fix pour la récursion infinie dans les RLS policies
-- Solution : Créer une fonction SECURITY DEFINER pour vérifier le rôle admin

-- Étape 1 : Créer une fonction sécurisée pour vérifier si l'utilisateur est admin
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

-- Étape 2 : Supprimer les anciennes policies
DROP POLICY IF EXISTS "Lecture publique des packs disponibles" ON pack;
DROP POLICY IF EXISTS "Admins peuvent tout lire" ON pack;
DROP POLICY IF EXISTS "Admins peuvent insérer" ON pack;
DROP POLICY IF EXISTS "Admins peuvent modifier" ON pack;
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON pack;

-- Étape 3 : Recréer les policies avec la fonction is_admin()

-- Policy 1: Tout le monde peut lire les packs disponibles
CREATE POLICY "Lecture publique des packs disponibles"
  ON pack
  FOR SELECT
  USING (disponible = true);

-- Policy 2: Les administrateurs peuvent tout lire
CREATE POLICY "Admins peuvent tout lire"
  ON pack
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 3: Les administrateurs peuvent insérer
CREATE POLICY "Admins peuvent insérer"
  ON pack
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy 4: Les administrateurs peuvent modifier
CREATE POLICY "Admins peuvent modifier"
  ON pack
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 5: Les administrateurs peuvent supprimer
CREATE POLICY "Admins peuvent supprimer"
  ON pack
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Vérification
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'pack'
ORDER BY cmd, policyname;

-- Test
SELECT * FROM pack ORDER BY ordre;
