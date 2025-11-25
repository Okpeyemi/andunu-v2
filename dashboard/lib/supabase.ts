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
