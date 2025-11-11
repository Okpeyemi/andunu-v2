-- Application de Row Level Security (RLS) sur toutes les tables principales
-- Tables concernées: pack, repas, commandes

-- ============================================================================
-- ÉTAPE 1: Créer la fonction is_admin() (si elle n'existe pas)
-- ============================================================================
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

-- ============================================================================
-- ÉTAPE 2: RLS sur la table PACK
-- ============================================================================

-- Activer RLS
ALTER TABLE pack ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Lecture publique des packs disponibles" ON pack;
DROP POLICY IF EXISTS "Admins peuvent tout lire" ON pack;
DROP POLICY IF EXISTS "Admins peuvent insérer" ON pack;
DROP POLICY IF EXISTS "Admins peuvent modifier" ON pack;
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON pack;

-- Créer les policies
CREATE POLICY "Lecture publique des packs disponibles"
  ON pack FOR SELECT
  USING (disponible = true);

CREATE POLICY "Admins peuvent tout lire"
  ON pack FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins peuvent insérer"
  ON pack FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins peuvent modifier"
  ON pack FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins peuvent supprimer"
  ON pack FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- ÉTAPE 3: RLS sur la table REPAS
-- ============================================================================

-- Activer RLS
ALTER TABLE repas ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Lecture publique des repas disponibles" ON repas;
DROP POLICY IF EXISTS "Admins peuvent tout lire repas" ON repas;
DROP POLICY IF EXISTS "Admins peuvent insérer repas" ON repas;
DROP POLICY IF EXISTS "Admins peuvent modifier repas" ON repas;
DROP POLICY IF EXISTS "Admins peuvent supprimer repas" ON repas;

-- Créer les policies
CREATE POLICY "Lecture publique des repas disponibles"
  ON repas FOR SELECT
  USING (disponible = true);

CREATE POLICY "Admins peuvent tout lire repas"
  ON repas FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins peuvent insérer repas"
  ON repas FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins peuvent modifier repas"
  ON repas FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins peuvent supprimer repas"
  ON repas FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- ÉTAPE 4: RLS sur la table COMMANDES
-- ============================================================================

-- Activer RLS
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Lecture publique des commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent tout lire commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent insérer commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent modifier commandes" ON commandes;
DROP POLICY IF EXISTS "Admins peuvent supprimer commandes" ON commandes;

-- Créer les policies
-- Note: Pour les commandes, on permet la lecture publique (pour la caisse)
-- Ajustez selon vos besoins de sécurité
CREATE POLICY "Lecture publique des commandes"
  ON commandes FOR SELECT
  USING (true);  -- Toutes les commandes visibles (ajustez si nécessaire)

CREATE POLICY "Admins peuvent tout lire commandes"
  ON commandes FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins peuvent insérer commandes"
  ON commandes FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins peuvent modifier commandes"
  ON commandes FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins peuvent supprimer commandes"
  ON commandes FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================

-- Vérifier que RLS est activé sur toutes les tables
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('pack', 'repas', 'commandes')
ORDER BY tablename;

-- Vérifier toutes les policies créées
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('pack', 'repas', 'commandes')
ORDER BY tablename, cmd, policyname;

-- Compter les policies par table
SELECT 
  tablename,
  COUNT(*) as nombre_policies
FROM pg_policies
WHERE tablename IN ('pack', 'repas', 'commandes')
GROUP BY tablename
ORDER BY tablename;

-- Test de lecture sur chaque table
SELECT 'pack' as table_name, COUNT(*) as total FROM pack
UNION ALL
SELECT 'repas' as table_name, COUNT(*) as total FROM repas
UNION ALL
SELECT 'commandes' as table_name, COUNT(*) as total FROM commandes;
