import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AdminAuthContextValue = {
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/** Returns true only when the JWT carries app_metadata.role = "admin". */
const sessionIsAdmin = (session: { access_token: string } | null): boolean => {
  if (!session) return false;
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    return payload?.app_metadata?.role === 'admin';
  } catch {
    return false;
  }
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(sessionIsAdmin(session));
      setIsLoading(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(sessionIsAdmin(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    if (!sessionIsAdmin(data.session)) {
      await supabase.auth.signOut();
      return { error: 'Access denied. Admin privileges required.' };
    }
    setIsAdmin(true);
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
