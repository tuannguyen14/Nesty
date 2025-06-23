export interface User {
  id: string; // UUID
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  created_at: string;
}