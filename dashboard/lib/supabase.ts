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

// Types pour les repas et accompagnements
export interface Repas {
  id: string;
  nom: string;
  description?: string;
  prix: number;
  image_url?: string;
  accompagnements_disponibles: string[]; // Array de noms d'accompagnements
  disponible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Accompagnement {
  id: string;
  nom: string;
  description?: string;
  prix: number; // Prix additionnel
  disponible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRepasInput {
  nom: string;
  description?: string;
  prix: number;
  image_url?: string;
  accompagnements_disponibles?: string[];
  disponible?: boolean;
}

export interface CreateAccompagnementInput {
  nom: string;
  description?: string;
  prix?: number;
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
