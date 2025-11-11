-- Ajout de Row Level Security (RLS) sur la table commandes
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

-- Étape 2: Activer Row Level Security (RLS) sur la table commandes
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

-- Étape 3: Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Lecture publique des commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent tout lire commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent insérer commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent modifier commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent supprimer commandes" ON commandes;

-- Étape 4: Créer les policies RLS pour la table commandes

-- Policy 1: Tout le monde peut lire les commandes (pour l'affichage public/caisse)
-- Note: Vous pouvez restreindre davantage selon vos besoins
CREATE POLICY "Lecture publique des commandes"
  ON commandes
  FOR SELECT
  USING (true);  -- Toutes les commandes sont visibles (ajustez selon vos besoins)

-- Policy 2: Les administrateurs peuvent tout lire
CREATE POLICY "Admins peuvent tout lire commandes"
  ON commandes
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 3: Les administrateurs peuvent insérer
CREATE POLICY "Admins peuvent insérer commandes"
  ON commandes
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy 4: Les administrateurs peuvent modifier
CREATE POLICY "Admins peuvent modifier commandes"
  ON commandes
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 5: Les administrateurs peuvent supprimer
CREATE POLICY "Admins peuvent supprimer commandes"
  ON commandes
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Vérification des policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'commandes'
ORDER BY cmd, policyname;

-- Vérification que RLS est activé
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename = 'commandes';

-- Test de lecture
SELECT COUNT(*) as total_commandes FROM commandes;
