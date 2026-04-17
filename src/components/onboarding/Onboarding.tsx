"use client";

import React, { useState } from "react";
import styles from "./Onboarding.module.css";
import { finishOnboardingData } from "@/services/supabaseService";
import { useAuth } from "../auth/AuthContext";

export default function Onboarding() {
  const { refreshProfile, user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    weight_kg: '',
    height_cm: '',
    activity_level: 1.2,
    goal: 'maintenance',
    routineCategory: 'Fuerza',
    routineLevel: 'Principiante',
    routineDays: [] as string[],
    targetKcal: 0
  });
  const [baseKcal, setBaseKcal] = useState(2000);
  const [isFinishing, setIsFinishing] = useState(false);

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const calculateBaseKcal = (goal: string) => {
    const { weight_kg, height_cm, age, gender, activity_level } = formData;
    const w = parseFloat(weight_kg);
    const h = parseFloat(height_cm);
    const a = parseInt(age);
    let bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    let tdee = bmr * activity_level;
    let target = tdee;
    if (goal === 'fat_loss') target -= 500;
    if (goal === 'muscle_gain') target += 300;
    return Math.round(target);
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    try {
      await finishOnboardingData(formData);
      await refreshProfile(); // Esto disparará que page.tsx nos saque de Onboarding y muestre Dashboard
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
    }
  };

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.contentBox}>
        {/* Barra de progreso */}
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>

        {step === 1 && (
          <div className={`${styles.stepAnimated} ${styles.fadeInZoom}`}>
            <h1 className={styles.displayPrompt}>¿CUÁL ES TU GÉNERO?</h1>
            <p className={styles.promptSubtitle}>Usado puramente para la fórmula BMR metabólica.</p>
            <div className={styles.grid2}>
              <button 
                onClick={() => { setFormData({...formData, gender: 'male'}); nextStep(); }} 
                className={styles.pilledBtn}
              >
                HOMBRE
              </button>
              <button 
                onClick={() => { setFormData({...formData, gender: 'female'}); nextStep(); }} 
                className={styles.pilledBtn}
              >
                MUJER
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`${styles.stepAnimated} ${styles.fadeIn}`}>
            <h1 className={styles.displayPrompt}>TU BIOMETRÍA</h1>
            <p className={styles.promptSubtitle}>Los números detrás de tu energía diaria.</p>
            <div className={styles.formCol}>
              <div className={styles.inputStack}>
                <label>Edad</label>
                <input 
                  type="number" 
                  value={formData.age}
                  placeholder="25"
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className={styles.glassInput}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.inputStack}>
                  <label>Peso (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight_kg}
                    placeholder="75.5"
                    onChange={e => setFormData({...formData, weight_kg: e.target.value})}
                    className={styles.glassInput}
                  />
                </div>
                <div className={styles.inputStack}>
                  <label>Altura (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height_cm}
                    placeholder="180"
                    onChange={e => setFormData({...formData, height_cm: e.target.value})}
                    className={styles.glassInput}
                  />
                </div>
              </div>
              <button 
                className={styles.nextBtn}
                onClick={nextStep}
                disabled={!formData.age || !formData.weight_kg || !formData.height_cm}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.stepAnimated} ${styles.fadeIn}`}>
            <h1 className={styles.displayPrompt}>NIVEL DE ACTIVIDAD</h1>
            <p className={styles.promptSubtitle}>¿Qué tan duro entrenas en tu día general?</p>
            <div className={styles.formCol}>
              {[
                { val: 1.2, label: "Sedentario", sub: "Trabajo de oficina, poco a nada de gym" },
                { val: 1.375, label: "Ligero", sub: "1 a 3 días a la semana" },
                { val: 1.55, label: "Moderado", sub: "3 a 5 días duros" },
                { val: 1.725, label: "Atleta", sub: "6/7 días a la semana extremo" }
              ].map(lvl => (
                <button 
                  key={lvl.val}
                  onClick={() => { setFormData({...formData, activity_level: lvl.val}); nextStep(); }}
                  className={styles.listBtn}
                >
                  <span className={styles.listTitle}>{lvl.label}</span>
                  <span className={styles.listSub}>{lvl.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={`${styles.stepAnimated} ${styles.fadeIn}`}>
            <h1 className={styles.displayPrompt}>TU OBJETIVO GLOBAL</h1>
             <p className={styles.promptSubtitle}>Fijemos tu norte metabólico.</p>
            <div className={styles.formCol}>
              {[
                { id: 'fat_loss', label: '🔥 Perder Grasa' },
                { id: 'maintenance', label: '⚖️ Mantenimiento' },
                { id: 'muscle_gain', label: '💪 Ganar Músculo' }
              ].map(g => (
                <button 
                  key={g.id}
                  onClick={() => {
                    const computedKcal = calculateBaseKcal(g.id);
                    setBaseKcal(computedKcal);
                    setFormData({...formData, goal: g.id, targetKcal: computedKcal});
                    nextStep();
                  }}
                  className={styles.listBtn}
                >
                  <span className={styles.listTitle} style={{fontSize: "1.125rem"}}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={`${styles.stepAnimated} ${styles.fadeIn}`}>
            <h1 className={styles.displayPrompt}>TU ENTRENAMIENTO</h1>
            <p className={styles.promptSubtitle}>¿Qué rutina inicial deseas instalar en tu calendario?</p>
            
            <div className={styles.formCol} style={{ gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Categoría</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Fuerza', 'Calistenia', 'Cardio', 'Kettlebell'].map(cat => (
                    <button 
                      key={cat}
                      className={formData.routineCategory === cat ? styles.pilledBtn : styles.listBtn}
                      style={formData.routineCategory === cat ? { padding: '8px 16px', minHeight: 'auto'} : { padding: '8px 16px', minHeight: 'auto', flex: 1 }}
                      onClick={() => setFormData({...formData, routineCategory: cat})}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nivel</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Principiante', 'Básico', 'Intermedio', 'Atleta'].map(lvl => (
                    <button 
                      key={lvl}
                      className={formData.routineLevel === lvl ? styles.pilledBtn : styles.listBtn}
                      style={formData.routineLevel === lvl ? { padding: '8px 16px', minHeight: 'auto'} : { padding: '8px 16px', minHeight: 'auto', flex: 1 }}
                      onClick={() => setFormData({...formData, routineLevel: lvl})}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Días que entrenarás</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => {
                    const isSelected = formData.routineDays.includes(dia);
                    return (
                      <button 
                        key={dia}
                        className={isSelected ? styles.pilledBtn : styles.listBtn}
                        style={isSelected ? { padding: '8px', minHeight: 'auto'} : { padding: '8px', minHeight: 'auto'}}
                        onClick={() => {
                          const newDays = isSelected 
                            ? formData.routineDays.filter(d => d !== dia)
                            : [...formData.routineDays, dia];
                          setFormData({...formData, routineDays: newDays});
                        }}
                      >
                        {dia.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <button 
                onClick={nextStep}
                className={styles.nextBtn}
                disabled={formData.routineDays.length === 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className={`${styles.stepAnimated} ${styles.fadeIn}`}>
             <h1 className={styles.displayPrompt}>CALORÍAS DIARIAS</h1>
             <p className={styles.promptSubtitle}>
               {isFinishing ? "Configurando tu entorno..." : "Basado en tu perfil, recomendamos esto. Ajusta si lo deseas."}
             </p>

             <div className={styles.formCol}>
                <div className={styles.inputStack} style={{ alignItems: 'center' }}>
                  <label style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>Tu Objetivo Kcal</label>
                  <input 
                    type="number" 
                    value={formData.targetKcal}
                    onChange={e => setFormData({...formData, targetKcal: Number(e.target.value)})}
                    className={styles.glassInput}
                    style={{ fontSize: '3rem', textAlign: 'center', fontWeight: '900', color: '#fff', width: '200px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary-text)' }}>Base recomendada: {baseKcal} kcal</span>
                </div>

                <button 
                  className={`${styles.nextBtn} ${isFinishing ? styles.disabledRow : ''}`}
                  onClick={finishOnboarding}
                  disabled={isFinishing || formData.targetKcal < 1000}
                  style={{ marginTop: '24px', backgroundColor: 'var(--accent)', color: '#000' }}
                >
                  {isFinishing ? 'Iniciando Sistema...' : 'Aceptar y Comenzar 🚀'}
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
