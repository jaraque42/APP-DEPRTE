"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { getMongoUserDoc } from '@/actions/dbActions';

import { registerMongoUser } from '@/actions/dbActions';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  userDoc: any | null;
  refreshProfile: () => Promise<void>;
  login: (e: string, p: string) => Promise<void>;
  register: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, loading: true, userDoc: null, 
    refreshProfile: async () => {}, login: async () => {}, register: async () => {}, logout: async () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userDoc, setUserDoc] = useState<any>(null);

  const refreshProfile = async () => {
    if (session?.user?.id) {
        const local = localStorage.getItem('fit_mock_user_doc');
        if (local) {
            setUserDoc(JSON.parse(local));
            return;
        }
        
        try {
            const profile = await getMongoUserDoc(session.user.id);
            setUserDoc(profile);
        } catch (e) {
            console.error("Error refreshing profile", e);
        }
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
        refreshProfile();
    } else {
        setUserDoc(null);
    }
  }, [status, session]);

  const login = async (e: string, p: string) => {
      const res = await signIn('credentials', { email: e, password: p, redirect: false });
      if (res?.error) throw new Error(res.error);
  };

  const register = async (e: string, p: string) => {
      await registerMongoUser(e, p);
      await login(e, p);
  };

  const logout = async () => {
      await signOut({ redirect: false });
  };

  const value = {
    user: session?.user || null,
    loading: status === 'loading',
    userDoc,
    refreshProfile,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
