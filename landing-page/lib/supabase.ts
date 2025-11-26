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

// Types pour les commandes
export type StatutPaiement = 'pending' | 'paid' | 'failed' | 'refunded';
export type StatutCommande = 'en_attente' | 'confirmee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';
export type ModePaiement = 'daily' | 'weekly';

export interface MealDetails {
  mainDish: string;
  price: number;
  accompagnements?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
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

export interface CreateCommandeInput {
  client_nom: string;
  client_telephone: string;
  adresse_livraison: string;
  heure_livraison: string;
  jours_selectionnes: string[];
  repas: Record<string, MealDetails>;
  mode_paiement: ModePaiement;
  montant_total: number;
  transaction_id?: string;
}

// Types pour les tables repas et accompagnements
export interface Repas {
  id: string;
  name: string;
  prices: number[];
  disponible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Accompagnement {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  disponible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RepasAccompagnement {
  repas_id: string;
  accompagnement_id: string;
  created_at?: string;
}
