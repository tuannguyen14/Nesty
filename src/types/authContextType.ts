// types/authContextType.ts
import { UserProfile } from './userProfile';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
  isTabActive?: boolean; // Thêm để track tab state
  refreshUser?: () => Promise<void>; // Thêm để manually refresh user
}