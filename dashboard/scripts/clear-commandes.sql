-- Supprimer toutes les commandes SAUF la dernière créée aujourd'hui
-- ATTENTION: Cette opération est irréversible!

-- Étape 1: Voir la dernière commande d'aujourd'hui (pour vérification)
SELECT 
  id, 
  client_nom, 
  client_telephone, 
  created_at,
  montant_total
FROM commandes
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;

-- Étape 2: Supprimer toutes les commandes SAUF la dernière d'aujourd'hui
DELETE FROM commandes
WHERE id NOT IN (
  SELECT id
  FROM commandes
  WHERE DATE(created_at) = CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1
);

-- Si aucune commande n'existe aujourd'hui, cette requête supprimera TOUTES les commandes
-- Pour éviter cela, utilisez plutôt:

-- Version sécurisée (ne supprime que si une commande existe aujourd'hui)
DO $$
DECLARE
  last_today_id UUID;
BEGIN
  -- Trouver la dernière commande d'aujourd'hui
  SELECT id INTO last_today_id
  FROM commandes
  WHERE DATE(created_at) = CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Si une commande existe aujourd'hui, supprimer toutes les autres
  IF last_today_id IS NOT NULL THEN
    DELETE FROM commandes WHERE id != last_today_id;
    RAISE NOTICE 'Commandes supprimées. Commande conservée: %', last_today_id;
  ELSE
    RAISE NOTICE 'Aucune commande trouvée aujourd''hui. Aucune suppression effectuée.';
  END IF;
END $$;
