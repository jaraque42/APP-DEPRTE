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
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, loading: true, userDoc: null, 
    refreshProfile: async () => {}, sendMagicLink: async () => {}, logout: async () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userDoc, setUserDoc] = useState<any>(null);

  const refreshProfile = async () => {
    if ((session?.user as any)?.id) {
        const local = localStorage.getItem('fit_mock_user_doc');
        if (local) {
            setUserDoc(JSON.parse(local));
            return;
        }
        
        try {
            const profile = await getMongoUserDoc((session?.user as any).id);
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

  const sendMagicLink = async (email: string) => {
      const res = await signIn('email', { email, redirect: false });
      if (res?.error) throw new Error(res.error);
  };

  const logout = async () => {
      await signOut({ redirect: false });
  };

  const value = {
    user: session?.user || null,
    loading: status === 'loading',
    userDoc,
    refreshProfile,
    sendMagicLink,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
