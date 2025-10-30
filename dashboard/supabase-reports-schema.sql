-- Table pour stocker les rapports générés
CREATE TABLE IF NOT EXISTS rapports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  
  -- Statistiques générales
  total_commandes INTEGER DEFAULT 0,
  total_revenus DECIMAL(10, 2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  nouveaux_clients INTEGER DEFAULT 0,
  
  -- Statistiques par statut
  commandes_en_attente INTEGER DEFAULT 0,
  commandes_confirmees INTEGER DEFAULT 0,
  commandes_en_preparation INTEGER DEFAULT 0,
  commandes_en_livraison INTEGER DEFAULT 0,
  commandes_livrees INTEGER DEFAULT 0,
  commandes_annulees INTEGER DEFAULT 0,
  
  -- Statistiques de paiement
  paiements_reussis INTEGER DEFAULT 0,
  paiements_en_attente INTEGER DEFAULT 0,
  paiements_echoues INTEGER DEFAULT 0,
  
  -- Repas les plus vendus (JSON)
  repas_populaires JSONB,
  
  -- Métadonnées
  genere_par UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rapports_type ON rapports(type);
CREATE INDEX IF NOT EXISTS idx_rapports_periode ON rapports(periode_debut, periode_fin);
CREATE INDEX IF NOT EXISTS idx_rapports_created_at ON rapports(created_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_rapports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rapports_updated_at
  BEFORE UPDATE ON rapports
  FOR EACH ROW
  EXECUTE FUNCTION update_rapports_updated_at();

-- Vue pour les statistiques en temps réel
CREATE OR REPLACE VIEW statistiques_temps_reel AS
SELECT
  COUNT(DISTINCT c.id) as total_commandes,
  COALESCE(SUM(c.montant_total), 0) as total_revenus,
  COUNT(DISTINCT c.client_telephone) as total_clients,
  COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN c.client_telephone END) as nouveaux_clients_30j,
  COUNT(CASE WHEN c.statut = 'en_attente' THEN 1 END) as commandes_en_attente,
  COUNT(CASE WHEN c.statut = 'confirmee' THEN 1 END) as commandes_confirmees,
  COUNT(CASE WHEN c.statut = 'en_preparation' THEN 1 END) as commandes_en_preparation,
  COUNT(CASE WHEN c.statut = 'en_livraison' THEN 1 END) as commandes_en_livraison,
  COUNT(CASE WHEN c.statut = 'livree' THEN 1 END) as commandes_livrees,
  COUNT(CASE WHEN c.statut = 'annulee' THEN 1 END) as commandes_annulees,
  COUNT(CASE WHEN c.statut_paiement = 'paid' THEN 1 END) as paiements_reussis,
  COUNT(CASE WHEN c.statut_paiement = 'pending' THEN 1 END) as paiements_en_attente,
  COUNT(CASE WHEN c.statut_paiement = 'failed' THEN 1 END) as paiements_echoues
FROM commandes c;

-- Fonction pour générer un rapport automatiquement
CREATE OR REPLACE FUNCTION generer_rapport(
  p_type VARCHAR,
  p_periode_debut DATE,
  p_periode_fin DATE,
  p_genere_par UUID
)
RETURNS UUID AS $$
DECLARE
  v_rapport_id UUID;
  v_titre VARCHAR;
BEGIN
  -- Générer le titre
  v_titre := 'Rapport ' || p_type || ' du ' || p_periode_debut || ' au ' || p_periode_fin;
  
  -- Insérer le rapport avec les statistiques calculées
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
  )
  SELECT
    v_titre,
    p_type,
    p_periode_debut,
    p_periode_fin,
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
    COUNT(CASE WHEN c.statut_paiement = 'failed' THEN 1 END),
    p_genere_par
  FROM commandes c
  WHERE c.created_at::DATE BETWEEN p_periode_debut AND p_periode_fin
  RETURNING id INTO v_rapport_id;
  
  RETURN v_rapport_id;
END;
$$ LANGUAGE plpgsql;

-- Permissions (à ajuster selon vos besoins)
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;

-- Policy pour les super admins
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
