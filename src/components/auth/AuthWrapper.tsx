"use client";

import { SessionProvider } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/auth/AuthContext";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
