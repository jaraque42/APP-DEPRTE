"use client";

import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    
    try {
      await sendMagicLink(email);
      setSuccessMsg(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al enviar el enlace. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <div className={styles.successIcon}>📧</div>
          <h1 className={styles.brandTitle}>REVISA TU CORREO</h1>
          <p className={styles.subtitle}>
            Hemos enviado un enlace de acceso a <strong>{email}</strong>. 
            Haz clic en el botón del correo para entrar a la app.
          </p>
          <button 
            className={styles.toggleModeBtn} 
            onClick={() => setSuccessMsg(false)}
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

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
          Entra con tu email (sin contraseñas)
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
          
          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Enviando enlace..." : "Recibir Link de Acceso"}
          </button>
        </form>

        <p className={styles.footerNote}>
          Si no tienes cuenta, se creará una automáticamente al entrar.
        </p>
      </div>
    </div>
  );
}
