'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/userProfile';
import { AuthContextType } from '@/types/authContextType';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true); // Thêm state để track initial load

  // Hàm lấy thêm thông tin từ bảng users
  const enrichUserData = async (authUser: any): Promise<UserProfile> => {
    const baseUser: UserProfile = {
      id: authUser.id,
      email: authUser.email || '',
      created_at: authUser.created_at,
      full_name: null,
      phone: null,
      address: null,
      role: undefined
    };

    try {
      // Thử lấy thêm thông tin từ bảng users
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('full_name, phone, address, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.log('Error fetching user profile:', error);
        return baseUser;
      }

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

    return baseUser;
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.log('Auth error:', error);
          setUser(null);
          return;
        }

        if (authUser) {
          const enrichedUser = await enrichUserData(authUser);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitializing(false); // Initial load hoàn thành
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        // Sử dụng setTimeout để tránh blocking - rất quan trọng!
        // onAuthStateChange được gọi khi switch tabs, cần nonblocking
        setTimeout(async () => {
          try {
            const enrichedUser = await enrichUserData(session.user);
            setUser(enrichedUser);
          } catch (error) {
            console.log('Error enriching user data:', error);
            // Fallback về basic user data nếu không lấy được profile
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              created_at: session.user.created_at,
              full_name: null,
              phone: null,
              address: null,
              role: undefined
            });
          } finally {
            // Chỉ set loading false nếu đã qua initial load
            if (!initializing) {
              setLoading(false);
            }
          }
        }, 0);
      } else {
        setUser(null);
        // Chỉ set loading false nếu đã qua initial load
        if (!initializing) {
          setLoading(false);
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};