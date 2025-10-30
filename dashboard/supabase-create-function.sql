-- Vérifier si la table rapports existe, sinon la créer
CREATE TABLE IF NOT EXISTS rapports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  total_commandes INTEGER DEFAULT 0,
  total_revenus DECIMAL(10, 2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  nouveaux_clients INTEGER DEFAULT 0,
  commandes_en_attente INTEGER DEFAULT 0,
  commandes_confirmees INTEGER DEFAULT 0,
  commandes_en_preparation INTEGER DEFAULT 0,
  commandes_en_livraison INTEGER DEFAULT 0,
  commandes_livrees INTEGER DEFAULT 0,
  commandes_annulees INTEGER DEFAULT 0,
  paiements_reussis INTEGER DEFAULT 0,
  paiements_en_attente INTEGER DEFAULT 0,
  paiements_echoues INTEGER DEFAULT 0,
  repas_populaires JSONB,
  genere_par UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS generer_rapport(VARCHAR, DATE, DATE, UUID);

-- Créer la fonction pour générer un rapport
CREATE OR REPLACE FUNCTION generer_rapport(
  p_type VARCHAR,
  p_periode_debut DATE,
  p_periode_fin DATE,
  p_genere_par UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rapport_id UUID;
  v_titre VARCHAR;
  v_total_commandes INTEGER;
  v_total_revenus DECIMAL(10, 2);
  v_total_clients INTEGER;
  v_nouveaux_clients INTEGER;
  v_commandes_en_attente INTEGER;
  v_commandes_confirmees INTEGER;
  v_commandes_en_preparation INTEGER;
  v_commandes_en_livraison INTEGER;
  v_commandes_livrees INTEGER;
  v_commandes_annulees INTEGER;
  v_paiements_reussis INTEGER;
  v_paiements_en_attente INTEGER;
  v_paiements_echoues INTEGER;
BEGIN
  -- Générer le titre
  v_titre := 'Rapport ' || p_type || ' du ' || p_periode_debut || ' au ' || p_periode_fin;
  
  -- Calculer les statistiques
  SELECT
    COUNT(DISTINCT c.id),
    COALESCE(SUM(c.montant_total), 0),
    COUNT(DISTINCT c.client_telephone),
    COUNT(DISTINCT CASE WHEN c.created_at::DATE BETWEEN p_periode_debut AND p_periode_fin THEN c.client_telephone END),
    COUNT(CASE WHEN c.statut = 'en_attente' THEN 1 END),
    COUNT(CASE WHEN c.statut = 'confirmee' THEN 1 END),
    COUNT(CASE WHEN c.statut = 'en_preparation' THEN 1 END),
    COUNT(CASE WHEN c.statut = 'en_livraison' THEN 1 END),
    COUNT(CASE WHEN c.statut = 'livree' THEN 1 END),
    COUNT(CASE WHEN c.statut = 'annulee' THEN 1 END),
    COUNT(CASE WHEN c.statut_paiement = 'paid' THEN 1 END),
    COUNT(CASE WHEN c.statut_paiement = 'pending' THEN 1 END),
    COUNT(CASE WHEN c.statut_paiement = 'failed' THEN 1 END)
  INTO
    v_total_commandes,
    v_total_revenus,
    v_total_clients,
    v_nouveaux_clients,
    v_commandes_en_attente,
    v_commandes_confirmees,
    v_commandes_en_preparation,
    v_commandes_en_livraison,
    v_commandes_livrees,
    v_commandes_annulees,
    v_paiements_reussis,
    v_paiements_en_attente,
    v_paiements_echoues
  FROM commandes c
  WHERE c.created_at::DATE BETWEEN p_periode_debut AND p_periode_fin;
  
  -- Insérer le rapport
  INSERT INTO rapports (
    titre,
    type,
    periode_debut,
    periode_fin,
    total_commandes,
    total_revenus,
    total_clients,
    nouveaux_clients,
    commandes_en_attente,
    commandes_confirmees,
    commandes_en_preparation,
    commandes_en_livraison,
    commandes_livrees,
    commandes_annulees,
    paiements_reussis,
    paiements_en_attente,
    paiements_echoues,
    genere_par
  ) VALUES (
    v_titre,
    p_type,
    p_periode_debut,
    p_periode_fin,
    v_total_commandes,
    v_total_revenus,
    v_total_clients,
    v_nouveaux_clients,
    v_commandes_en_attente,
    v_commandes_confirmees,
    v_commandes_en_preparation,
    v_commandes_en_livraison,
    v_commandes_livrees,
    v_commandes_annulees,
    v_paiements_reussis,
    v_paiements_en_attente,
    v_paiements_echoues,
    p_genere_par
  ) RETURNING id INTO v_rapport_id;
  
  RETURN v_rapport_id;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION generer_rapport(VARCHAR, DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generer_rapport(VARCHAR, DATE, DATE, UUID) TO service_role;

-- Activer RLS sur la table rapports si ce n'est pas déjà fait
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;

-- Créer une policy pour permettre aux super admins de tout faire
DROP POLICY IF EXISTS "Super admins peuvent tout faire sur rapports" ON rapports;
CREATE POLICY "Super admins peuvent tout faire sur rapports"
  ON rapports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rapports_type ON rapports(type);
CREATE INDEX IF NOT EXISTS idx_rapports_periode ON rapports(periode_debut, periode_fin);
CREATE INDEX IF NOT EXISTS idx_rapports_created_at ON rapports(created_at DESC);
