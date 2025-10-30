-- Table pour stocker les logs des actions des super_admin
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations sur l'utilisateur
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  
  -- Informations sur l'action
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'order', 'meal', 'report', etc.
  entity_id UUID, -- ID de l'entité concernée
  
  -- Détails de l'action
  description TEXT NOT NULL,
  metadata JSONB, -- Données supplémentaires (ancien état, nouvel état, etc.)
  
  -- Informations techniques
  ip_address VARCHAR(45), -- IPv4 ou IPv6
  user_agent TEXT,
  
  -- Statut
  status VARCHAR(20) DEFAULT 'success', -- 'success', 'error', 'warning'
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_entity_type ON logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);

-- Index composite pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_logs_user_action ON logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_entity ON logs(entity_type, entity_id);

-- Fonction pour nettoyer les vieux logs (optionnel - garder seulement 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction helper pour créer un log facilement
CREATE OR REPLACE FUNCTION create_log(
  p_user_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_email VARCHAR;
  v_user_name VARCHAR;
BEGIN
  -- Récupérer les infos de l'utilisateur
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM auth.users
  LEFT JOIN profiles ON auth.users.id = profiles.id
  WHERE auth.users.id = p_user_id;
  
  -- Insérer le log
  INSERT INTO logs (
    user_id,
    user_email,
    user_name,
    action,
    entity_type,
    entity_id,
    description,
    metadata,
    status
  ) VALUES (
    p_user_id,
    v_user_email,
    v_user_name,
    p_action,
    p_entity_type,
    p_entity_id,
    p_description,
    p_metadata,
    p_status
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques des logs
CREATE OR REPLACE VIEW logs_statistics AS
SELECT
  DATE(created_at) as date,
  action,
  entity_type,
  status,
  COUNT(*) as count
FROM logs
GROUP BY DATE(created_at), action, entity_type, status
ORDER BY date DESC;

-- Permissions (RLS)
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy pour les super admins (peuvent tout voir)
CREATE POLICY "Super admins peuvent voir tous les logs"
  ON logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy pour l'insertion (seulement via fonction ou service role)
CREATE POLICY "Insertion des logs via service"
  ON logs
  FOR INSERT
  WITH CHECK (true);

-- Exemples de logs à créer automatiquement via triggers (optionnel)

-- Trigger pour logger les créations d'utilisateurs
CREATE OR REPLACE FUNCTION log_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_log(
    auth.uid(),
    'create',
    'user',
    NEW.id,
    'Création d''un nouvel utilisateur: ' || NEW.full_name,
    jsonb_build_object(
      'email', NEW.email,
      'role', NEW.role,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger (décommenter si vous voulez l'auto-logging)
-- CREATE TRIGGER trigger_log_user_creation
--   AFTER INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION log_user_creation();

-- Trigger pour logger les mises à jour de statut utilisateur
CREATE OR REPLACE FUNCTION log_user_status_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    PERFORM create_log(
      auth.uid(),
      'update',
      'user',
      NEW.id,
      'Changement de statut utilisateur: ' || OLD.status || ' → ' || NEW.status,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'user_email', NEW.email
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger (décommenter si vous voulez l'auto-logging)
-- CREATE TRIGGER trigger_log_user_status_update
--   AFTER UPDATE ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION log_user_status_update();

-- Donner les permissions nécessaires
GRANT SELECT ON logs TO authenticated;
GRANT INSERT ON logs TO authenticated;
GRANT EXECUTE ON FUNCTION create_log TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_logs TO authenticated;
