'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: 'user' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy thêm thông tin từ bảng users
  const enrichUserData = async (authUser: any) => {
    const baseUser = {
      id: authUser.id,
      email: authUser.email || '',
      created_at: authUser.created_at
    };

    try {
      // Thử lấy thêm thông tin từ bảng users
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name, phone, address, role')
        .eq('id', authUser.id)
        .single();

      if (userProfile) {
        return {
          ...baseUser,
          full_name: userProfile.full_name,
          phone: userProfile.phone,
          address: userProfile.address,
          role: userProfile.role
        };
      }
    } catch (error) {
      console.log('Could not fetch additional user data:', error);
    }

    // Fallback về user data cơ bản nếu không lấy được từ bảng users
    return baseUser;
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const enrichedUser = await enrichUserData(authUser);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const enrichedUser = await enrichUserData(session.user);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);