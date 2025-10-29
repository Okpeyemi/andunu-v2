-- Création de la table commandes
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations client
  client_nom VARCHAR(255) NOT NULL,
  client_telephone VARCHAR(50) NOT NULL,
  
  -- Détails de livraison
  adresse_livraison TEXT NOT NULL,
  heure_livraison VARCHAR(50) NOT NULL,
  
  -- Détails de la commande
  jours_selectionnes TEXT[] NOT NULL,
  repas JSONB NOT NULL, -- Format: {"Lundi": {"mainDish": "Riz sauce", "ingredients": ["Poisson", "Banane"]}}
  
  -- Paiement
  mode_paiement VARCHAR(20) NOT NULL CHECK (mode_paiement IN ('daily', 'weekly')),
  montant_total INTEGER NOT NULL,
  transaction_id VARCHAR(255),
  statut_paiement VARCHAR(20) DEFAULT 'pending' CHECK (statut_paiement IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Statut de la commande
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'en_preparation', 'en_livraison', 'livree', 'annulee')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_commandes_client_telephone ON public.commandes(client_telephone);
CREATE INDEX IF NOT EXISTS idx_commandes_transaction_id ON public.commandes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON public.commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_created_at ON public.commandes(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - À ajuster selon vos besoins
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de créer une commande
CREATE POLICY "Permettre création commande" ON public.commandes
  FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la lecture de ses propres commandes (par téléphone)
CREATE POLICY "Permettre lecture commande par téléphone" ON public.commandes
  FOR SELECT
  USING (true); -- Pour l'instant, on permet à tous de lire. À ajuster si besoin d'authentification

-- Politique pour permettre la mise à jour (réservé aux admins ou système)
CREATE POLICY "Permettre mise à jour commande" ON public.commandes
  FOR UPDATE
  USING (true); -- À ajuster selon vos besoins d'authentification
