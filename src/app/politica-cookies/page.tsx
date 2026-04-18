import styles from './CookiesPage.module.css';

export default function PoliticaCookies() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Política de Cookies</h1>
        <p className={styles.updated}>Última actualización: Abril 2026</p>

        <section className={styles.section}>
          <h2>¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas
            nuestra aplicación web. Son necesarias para el correcto funcionamiento de ciertos aspectos
            de la plataforma.
          </p>
        </section>

        <section className={styles.section}>
          <h2>¿Qué cookies utilizamos?</h2>
          
          <div className={styles.cookieCard}>
            <h3>🔐 Cookies Esenciales</h3>
            <p>Son estrictamente necesarias para el funcionamiento de la app. No se pueden desactivar.</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Propósito</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>next-auth.session-token</code></td>
                  <td>Mantener tu sesión iniciada</td>
                  <td>30 días</td>
                </tr>
                <tr>
                  <td><code>next-auth.csrf-token</code></td>
                  <td>Protección contra ataques CSRF</td>
                  <td>Sesión</td>
                </tr>
                <tr>
                  <td><code>next-auth.callback-url</code></td>
                  <td>Redirección tras autenticación</td>
                  <td>Sesión</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.cookieCard}>
            <h3>📊 Almacenamiento Local</h3>
            <p>Usamos localStorage (no son cookies técnicamente, pero te informamos igualmente):</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Propósito</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>cookie_consent</code></td>
                  <td>Recordar tu preferencia de cookies</td>
                </tr>
                <tr>
                  <td><code>fit_mock_user_doc</code></td>
                  <td>Datos de perfil cacheados localmente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Cookies de terceros</h2>
          <p>
            <strong>No utilizamos</strong> cookies de rastreo, analítica, publicidad ni redes sociales.
            Tu privacidad es nuestra prioridad.
          </p>
        </section>

        <section className={styles.section}>
          <h2>¿Cómo gestionar las cookies?</h2>
          <p>
            Puedes eliminar las cookies en cualquier momento desde la configuración de tu navegador.
            Ten en cuenta que si eliminas las cookies esenciales, deberás iniciar sesión de nuevo.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contacto</h2>
          <p>
            Si tienes preguntas sobre nuestra política de cookies, contacta con nosotros en{" "}
            <a href="mailto:eolcsimfit@gmail.com" className={styles.link}>eolcsimfit@gmail.com</a>.
          </p>
        </section>

        <a href="/" className={styles.backBtn}>← Volver a la app</a>
      </div>
    </div>
  );
}
