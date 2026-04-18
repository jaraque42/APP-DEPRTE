import React from 'react';
import styles from '@/components/auth/LoginPage.module.css';

export default function VerifyRequest() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <div className={styles.successIcon}>📧</div>
        <h1 className={styles.brandTitle}>REVISA TU CORREO</h1>
        <p className={styles.subtitle}>
          Se ha enviado un enlace de acceso a tu correo electrónico. 
          Haz clic en el enlace para iniciar sesión.
        </p>
      </div>
    </div>
  );
}
