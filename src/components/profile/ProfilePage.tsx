"use client";

import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '@/components/auth/AuthContext';
import { updateUserProfile } from '@/services/supabaseService';
import { User, Target, FileText, Camera, Check, Save } from 'lucide-react';

export default function ProfilePage() {
  const { userDoc, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    goals: '',
    avatar_url: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (userDoc) {
      setFormData({
        name: userDoc.name || '',
        bio: userDoc.bio || '',
        goals: userDoc.goals || '',
        avatar_url: userDoc.avatar_url || ''
      });
    }
  }, [userDoc]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo'
  ];

  return (
    <div className={styles.profileContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mi Perfil</h1>
        <p className={styles.subtitle}>Gestiona tu identidad y objetivos personales.</p>
      </header>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img 
              src={formData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
              alt="Profile" 
              className={styles.avatar} 
            />
            {isEditing && (
              <div className={styles.avatarOverlay}>
                <Camera size={24} />
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className={styles.avatarPicker}>
              <p className={styles.pickerTitle}>Elige un avatar:</p>
              <div className={styles.avatarGrid}>
                {avatars.map(url => (
                  <img 
                    key={url} 
                    src={url} 
                    className={`${styles.pickerItem} ${formData.avatar_url === url ? styles.selectedAvatar : ''}`}
                    onClick={() => setFormData({...formData, avatar_url: url})}
                  />
                ))}
              </div>
            </div>
          )}
          
          {!isEditing && <h2 className={styles.userName}>{formData.name || 'Atleta'}</h2>}
          {!isEditing && <p className={styles.userEmail}>{userDoc?.email}</p>}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <User size={16} />
              Nombre Público
            </label>
            {isEditing ? (
              <input 
                type="text" 
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Tu nombre..."
              />
            ) : (
              <p className={styles.value}>{formData.name || 'No definido'}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <FileText size={16} />
              Sobre mí (Biografía)
            </label>
            {isEditing ? (
              <textarea 
                className={styles.textarea}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Cuéntanos un poco sobre ti..."
              />
            ) : (
              <p className={styles.value}>{formData.bio || 'Sin biografía.'}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Target size={16} />
              Mis Objetivos
            </label>
            {isEditing ? (
              <textarea 
                className={styles.textarea}
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                placeholder="¿Qué quieres conseguir? (ej: Perder 5kg, Mejorar fuerza...)"
              />
            ) : (
              <p className={styles.value}>{formData.goals || 'Sin objetivos definidos.'}</p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button className={styles.btnSecondary} onClick={() => setIsEditing(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Guardando...' : (
                  <>
                    <Save size={18} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </>
          ) : (
            <button className={styles.btnPrimary} onClick={() => setIsEditing(true)}>
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className={styles.dangerZone}>
        <button onClick={logout} className={styles.logoutBtn}>Cerrar Sesión</button>
      </div>

      {successMsg && (
        <div className={styles.toast}>
          <Check size={18} />
          <span>Perfil actualizado correctamente</span>
        </div>
      )}
    </div>
  );
}
