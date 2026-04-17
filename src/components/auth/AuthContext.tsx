"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, handleLogin, handleSignUp, getUserDoc, onAuthStateChange, handleLogout as apiLogout } from "@/services/supabaseService";

interface AuthContextType {
  user: any;
  userDoc: any;
  loading: boolean;
  login: (e: string, p: string) => Promise<any>;
  register: (e: string, p: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetDoc = async () => {
    try {
      const doc = await getUserDoc();
      setUserDoc(doc);
    } catch (e) {
      console.error("Failed to fetch user doc", e);
    }
  };

  useEffect(() => {
    // Escuchar cambios en la sesión (Mock o Supabase real)
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchAndSetDoc();
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUserDoc = async () => {
    await fetchAndSetDoc();
  };

  const login = async (e: string, p: string) => {
    setLoading(true);
    try {
      const u = await handleLogin(e, p);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register = async (e: string, p: string) => {
    setLoading(true);
    try {
      const u = await handleSignUp(e, p);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setUserDoc(null);
  };


  return (
    <AuthContext.Provider value={{ user, userDoc, loading, login, register, logout, refreshUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
