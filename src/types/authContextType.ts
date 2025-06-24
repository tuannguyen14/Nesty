import { UserProfile } from './userProfile';

export interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    logout: () => void;
}