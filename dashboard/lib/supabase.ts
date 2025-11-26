import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript types for database tables
export interface Repas {
    id: string;
    name: string;
    prices: number[];
    disponible: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RepasAvecAccompagnements extends Repas {
    accompagnements: Accompagnement[];
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

// Order types
export type StatutCommande = 'en_attente' | 'confirmee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';

export interface Commande {
    id: string;
    client_nom: string;
    client_telephone: string;
    adresse_livraison: string;
    heure_livraison: string;
    jours_selectionnes: string[];
    repas: {
        [jour: string]: {
            mainDish: string;
            ingredients: string[];
        };
    };
    mode_paiement: 'daily' | 'weekly';
    statut_paiement: 'pending' | 'paid';
    montant_total: number;
    statut: StatutCommande;
    created_at: string;
    updated_at?: string;
}

// User/Profile types
export type UserRole = 'super_admin' | 'client';
export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface Profile {
    id: string;
    full_name: string;
    phone: string;
    address?: string | null;
    role: UserRole;
    status: AccountStatus;
    last_login_at?: string | null;
    created_at: string;
    updated_at?: string;
}

// Vendeur types
export interface Vendeur {
    id: string;
    nom_complet: string;
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
    actif: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateVendeurInput {
    nom_complet: string;
    telephone?: string;
    email?: string;
    adresse?: string;
    actif: boolean;
}

export interface VendeurAvecRepas extends Vendeur {
    repas: Array<Repas & { prix_vendeur?: number }>;
}

// Report/Statistics types
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

export interface Rapport {
    id: string;
    titre: string;
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
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
    genere_par: string;
    created_at: string;
}

// Log types
export type LogAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'view';
export type LogEntityType = 'user' | 'order' | 'meal' | 'report' | 'settings' | 'auth';
export type LogStatus = 'success' | 'error' | 'warning';

export interface Log {
    id: string;
    user_id?: string | null;
    user_name?: string | null;
    user_email?: string | null;
    action: LogAction;
    entity_type: LogEntityType;
    entity_id?: string | null;
    description: string;
    status: LogStatus;
    metadata?: any;
    created_at: string;
}
