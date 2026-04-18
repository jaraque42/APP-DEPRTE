"use client";

import React, { useState } from "react";
import styles from "./AppointmentModal.module.css";
import { X, CalendarDays, Clock, MessageSquare } from "lucide-react";

interface AppointmentModalProps {
  userName: string;
  userEmail: string;
  onClose: () => void;
}

export default function AppointmentModal({ userName, userEmail, onClose }: AppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch('/api/request-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userEmail, date, time, reason }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Error al enviar la solicitud');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Error de conexión');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✅</div>
            <h2>¡Solicitud Enviada!</h2>
            <p>Un profesional se pondrá en contacto contigo en tu email <strong>{userEmail}</strong>.</p>
            <button className={styles.submitBtn} onClick={onClose}>Entendido</button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <CalendarDays size={28} className={styles.headerIcon} />
              <h2>Solicitar Cita</h2>
              <p>Reserva una sesión con un profesional deportivo</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label><CalendarDays size={14} /> Fecha</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
                <div className={styles.field}>
                  <label><Clock size={14} /> Hora</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label><MessageSquare size={14} /> Motivo (opcional)</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Revisión de rutina, ajuste de dieta, lesión..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              {status === 'error' && <p className={styles.errorText}>{errorMsg}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
