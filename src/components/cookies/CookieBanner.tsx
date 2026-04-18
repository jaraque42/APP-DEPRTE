"use client";

import React, { useState, useEffect } from "react";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie_consent", "essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.textBlock}>
          <h3 className={styles.title}>🍪 Cookies</h3>
          <p className={styles.text}>
            Usamos cookies esenciales para la autenticación y el funcionamiento de la app. 
            No utilizamos cookies de rastreo ni publicidad.{" "}
            <a href="/politica-cookies" className={styles.link}>Política de Cookies</a>
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.essentialBtn} onClick={acceptEssential}>
            Solo esenciales
          </button>
          <button className={styles.acceptBtn} onClick={acceptAll}>
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
