"use client";

import { SessionProvider } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/auth/AuthContext";
import CookieBanner from "@/components/cookies/CookieBanner";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
        <CookieBanner />
      </AuthProvider>
    </SessionProvider>
  );
}
