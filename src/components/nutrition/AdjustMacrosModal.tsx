import React, { useState } from 'react';
import styles from '../dashboard/AddFoodModal.module.css'; // Reusing modal styles
import { updateUserMacros } from '@/services/supabaseService';
import { useAuth } from '@/components/auth/AuthContext';

export default function AdjustMacrosModal({ onClose }: { onClose: () => void }) {
  const { userDoc } = useAuth();
  const [kcal, setKcal] = useState(userDoc?.target_kcal || 2500);
  const [p, setP] = useState(userDoc?.target_protein || 150);
  const [c, setC] = useState(userDoc?.target_carbs || 300);
  const [f, setF] = useState(userDoc?.target_fats || 70);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserMacros({ kcal, p, c, f });
      window.location.reload(); // Reload or let Context refresh via USER_UPDATED event
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
            <h2 className={styles.title}>Ajustar Objetivos</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} style={{ color: "var(--accent)" }}>Calorías Diarias (kcal)</label>
            <input 
                type="number" 
                value={kcal}
                onChange={(e) => setKcal(Number(e.target.value))}
                className={styles.numberInput} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} style={{ color: "#3B82F6" }}>Proteínas (g)</label>
              <input 
                  type="number" 
                  value={p}
                  onChange={(e) => setP(Number(e.target.value))}
                  className={styles.numberInput} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} style={{ color: "#8B5CF6" }}>Carbs (g)</label>
              <input 
                  type="number" 
                  value={c}
                  onChange={(e) => setC(Number(e.target.value))}
                  className={styles.numberInput} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} style={{ color: "#F59E0B" }}>Grasas (g)</label>
              <input 
                  type="number" 
                  value={f}
                  onChange={(e) => setF(Number(e.target.value))}
                  className={styles.numberInput} 
              />
            </div>
          </div>

          <button 
              className={styles.confirmBtn}
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: '16px' }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
