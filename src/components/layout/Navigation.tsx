"use client";

import React, { useState } from "react";
import styles from "./Navigation.module.css";
import { Home, Apple, Dumbbell, Calendar, User, Users } from "lucide-react";

export default function Navigation({ active, onNavigate }: { active: string, onNavigate: (id: string) => void }) {
  const navItems = [
    { id: "home", icon: Home, label: "Dashboard" },
    { id: "diet", icon: Apple, label: "Dieta" },
    { id: "workout", icon: Dumbbell, label: "Entreno" },
    { id: "community", icon: Users, label: "Comunidad" },
    { id: "calendar", icon: Calendar, label: "Calendario" },
    { id: "profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className={styles.navContainer}>
      <div className={styles.navContent}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.active : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
            >
              <Icon size={24} className={styles.icon} strokeWidth={active === item.id ? 2.5 : 2} />
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

