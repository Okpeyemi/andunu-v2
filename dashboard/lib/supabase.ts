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
