"use client";

import React from "react";
import styles from "./AppLayout.module.css";
import Navigation from "./Navigation";
import ProgressWidget from "./ProgressWidget";

export default function AppLayout({ children, activeSection, onNavigate }: { children: React.ReactNode, activeSection: string, onNavigate: (id: string) => void }) {
  return (
    <div className={styles.appContainer}>
      {/* Sidebar 2 col (Desktop) / Bottom Nav (Mobile) */}
      <Navigation active={activeSection} onNavigate={onNavigate} />

      {/* Center 7 col */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Right Panel 3 col (Desktop) hidden on Mobile */}
      <aside className={styles.rightPanel}>
        <ProgressWidget />
      </aside>
    </div>
  );
}

