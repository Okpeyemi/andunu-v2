-- Script de correction pour la fonction is_admin()
-- Ce script corrige la fonction is_admin() pour utiliser la table 'profiles' 
-- au lieu de 'users' et le rôle 'super_admin'

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS is_admin();

-- Créer la fonction is_admin() corrigée
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO service_role;

-- Vérifier que la fonction fonctionne
SELECT 'Fonction is_admin() créée avec succès' as status;

-- Test de la fonction (optionnel - décommentez si vous voulez tester)
-- SELECT is_admin() as is_current_user_admin;
