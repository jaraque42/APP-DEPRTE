"use client";

import Dashboard from "@/components/dashboard/Dashboard";
import LoginPage from "@/components/auth/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import Onboarding from "@/components/onboarding/Onboarding";
import { useAuth } from "@/components/auth/AuthContext";
import { useState } from "react";
import DietPage from "@/components/nutrition/DietPage";
import WorkoutPage from "@/components/workout/WorkoutPage";
import CalendarPage from "@/components/calendar/CalendarPage";
import WorkoutSession from "@/components/workout/WorkoutSession";
import { initAudio } from "@/lib/audioUtils";

export default function Home() {
  const { user, userDoc, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [activeSessionPlan, setActiveSessionPlan] = useState<any>(null);

  const startWorkout = (plan: any) => {
    initAudio();
    setActiveSessionPlan(plan);
    setActiveSection("session");
  };

  if (loading) {
     // Estilo base en carga
     return <div style={{ height: "100vh", width: "100vw", backgroundColor: "#0A0A0A" }} />;
  }

  // 1. Gate de login
  if (!user) {
    return <LoginPage />;
  }

  // 2. Gate de Onboarding
  if (!userDoc || userDoc.onboarding_complete === false) {
    return <Onboarding />;
  }

  // 3. Modo Sesión (toma toda la pantalla)
  if (activeSection === "session" && activeSessionPlan) {
    return <WorkoutSession plan={activeSessionPlan} onComplete={() => setActiveSection("home")} />;
  }

  return (
    <AppLayout activeSection={activeSection} onNavigate={setActiveSection}>
      {activeSection === "home" && <Dashboard onStartWorkout={startWorkout} />}
      {activeSection === "diet" && <DietPage />}
      {activeSection === "workout" && <WorkoutPage onNavigate={setActiveSection} />}
      {activeSection === "calendar" && <CalendarPage onStartWorkout={startWorkout} />}
      {activeSection !== "home" && activeSection !== "diet" && activeSection !== "workout" && activeSection !== "calendar" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary-text)" }}>
          Sección "{activeSection}" en desarrollo... ⚡️
        </div>
      )}
    </AppLayout>
  );
}

