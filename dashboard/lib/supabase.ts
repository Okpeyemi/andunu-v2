import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PROJECT_API_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type UserRole = 'super_admin' | 'client';
export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  address?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les packs de prix
export interface Pack {
  id: string;
  name: string;
  price: number;
  description?: string;
  disponible: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
}

// Types pour les repas
export interface Repas {
  id: string;
  name: string;
  prices: number[]; // Tableau de prix (ex: [1000, 1500])
  pack_ids?: string[]; // IDs des packs sélectionnés
  disponible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRepasInput {
  name: string;
  prices: number[];
  pack_ids?: string[];
  disponible?: boolean;
}

export type StatutPaiement = 'pending' | 'paid' | 'failed' | 'refunded';
export type StatutCommande = 'en_attente' | 'confirmee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';
export type ModePaiement = 'daily' | 'weekly';

export interface MealDetails {
  mainDish: string;
  ingredients: string[];
}

export interface Commande {
  id: string;
  client_nom: string;
  client_telephone: string;
  adresse_livraison: string;
  heure_livraison: string;
  jours_selectionnes: string[];
  repas: Record<string, MealDetails>;
  mode_paiement: ModePaiement;
  montant_total: number;
  transaction_id?: string;
  statut_paiement: StatutPaiement;
  statut: StatutCommande;
  created_at: string;
  updated_at: string;
}

// Types pour les rapports
export type TypeRapport = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RepasPopulaire {
  nom: string;
  quantite: number;
  revenus: number;
}

export interface Rapport {
  id: string;
  titre: string;
  type: TypeRapport;
  periode_debut: string;
  periode_fin: string;
  total_commandes: number;
  total_revenus: number;
  total_clients: number;
  nouveaux_clients: number;
  commandes_en_attente: number;
  commandes_confirmees: number;
  commandes_en_preparation: number;
  commandes_en_livraison: number;
  commandes_livrees: number;
  commandes_annulees: number;
  paiements_reussis: number;
  paiements_en_attente: number;
  paiements_echoues: number;
  repas_populaires?: RepasPopulaire[];
  genere_par?: string;
  created_at: string;
  updated_at: string;
}

export interface StatistiquesTempsReel {
  total_commandes: number;
  total_revenus: number;
  total_clients: number;
  nouveaux_clients_30j: number;
  commandes_en_attente: number;
  commandes_confirmees: number;
  commandes_en_preparation: number;
  commandes_en_livraison: number;
  commandes_livrees: number;
  commandes_annulees: number;
  paiements_reussis: number;
  paiements_en_attente: number;
  paiements_echoues: number;
}

// Types pour les logs
export type LogAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'view';
export type LogEntityType = 'user' | 'order' | 'meal' | 'report' | 'settings' | 'auth';
export type LogStatus = 'success' | 'error' | 'warning';

export interface Log {
  id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  action: LogAction;
  entity_type: LogEntityType;
  entity_id?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: LogStatus;
  error_message?: string;
  created_at: string;
}
