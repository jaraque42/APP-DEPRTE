"use client";

import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { useAuth } from "./AuthContext";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Debe incluir una mayúscula";
  if (!/[a-z]/.test(password)) return "Debe incluir una minúscula";
  if (!/[0-9]/.test(password)) return "Debe incluir un número";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "Debe incluir un símbolo (!@#$...)";
  return null;
}

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score <= 2) return { level: score, label: "Débil", color: "#ff3b30" };
  if (score <= 3) return { level: score, label: "Media", color: "#ff9f0a" };
  if (score <= 4) return { level: score, label: "Fuerte", color: "#30d158" };
  return { level: score, label: "Muy fuerte", color: "#DFFF00" };
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isRegistering) {
      const validationError = validatePassword(password);
      if (validationError) {
        setErrorMsg(validationError);
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error de autenticación. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Password strength indicator (only when registering) */}
          {isRegistering && password.length > 0 && (
            <div className={styles.strengthContainer}>
              <div className={styles.strengthBarBg}>
                <div 
                  className={styles.strengthBarFill}
                  style={{ 
                    width: `${(strength.level / 5) * 100}%`,
                    backgroundColor: strength.color 
                  }}
                />
              </div>
              <span className={styles.strengthLabel} style={{ color: strength.color }}>
                {strength.label}
              </span>
              <ul className={styles.reqList}>
                <li className={password.length >= 8 ? styles.reqMet : ''}>8+ caracteres</li>
                <li className={/[A-Z]/.test(password) ? styles.reqMet : ''}>Mayúscula</li>
                <li className={/[0-9]/.test(password) ? styles.reqMet : ''}>Número</li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? styles.reqMet : ''}>Símbolo</li>
              </ul>
            </div>
          )}
          
          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Procesando..." : isRegistering ? "Crear Cuenta" : "Entrar"}
          </button>
        </form>

        <button 
          className={styles.toggleModeBtn} 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setErrorMsg("");
          }}
        >
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
    </div>
  );
}
