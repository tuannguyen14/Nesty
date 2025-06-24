export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: 'user' | 'admin';
  created_at: string;
}