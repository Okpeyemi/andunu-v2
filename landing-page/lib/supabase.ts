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
