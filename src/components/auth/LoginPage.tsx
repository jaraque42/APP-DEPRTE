"use client";

import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      // Si fue exitoso se desvanecerá gracias al Context re-renderizando Home/layout,
      // pero podemos provocar una mini-transición visual local si es necesario.
      setIsFadingOut(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales inválidas, intenta de nuevo.");
    }
  };

  return (
    <div className={`${styles.authContainer} ${isFadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.authBox}>
        <img 
          src="/logo.png" 
          alt="EOLCAIMFIT Logo" 
          style={{ width: '120px', height: '120px', margin: '0 auto 16px', display: 'block', borderRadius: '24px' }} 
        />
        <h1 className={styles.brandTitle}>EOLCAIM<span style={{color: "var(--accent)"}}>FIT</span></h1>
        <p className={styles.subtitle}>
          {isRegistering ? "Crea tu cuenta Atleta" : "Bienvenido de vuelta"}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className={styles.inputField} 
            />
          </div>
          <div className={styles.inputGroup}>
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className={styles.inputField} 
            />
          </div>
          
          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

          <button type="submit" className={styles.submitBtn}>
            {isRegistering ? "Unirse al equipo" : "Entrar a la app"}
          </button>
        </form>

        <button 
          className={styles.toggleModeBtn} 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setErrorMsg("");
          }}
        >
          {isRegistering ? "¿Ya tienes una cuenta? Únete." : "¿Elegible para atleta? Regístrate."}
        </button>
      </div>
    </div>
  );
}
