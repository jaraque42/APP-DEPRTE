import React, { useState, useEffect } from 'react';
import styles from './WorkoutSession.module.css';
import { WORKOUT_DB } from '@/data/workoutsData';
import { Play, Pause, Square, ChevronLeft } from 'lucide-react';
import { logDailyStatus } from '@/services/supabaseService';
import { useAuth } from '@/components/auth/AuthContext';
import TrainingTimer from './TrainingTimer';
import { playTickSound, playSuccessSound } from '@/lib/audioUtils';

export default function WorkoutSession({ plan, onComplete }: { plan: any, onComplete: () => void }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'countdown' | 'active'>('countdown');
  const [countdown, setCountdown] = useState(5);
  // Timer state
  const [activeRestTime, setActiveRestTime] = useState<number | null>(null);

  // Derive exercises from plan.routine_id and plan.level
  // Note: plan.routine_id actually holds the top level workout category id (e.g. 'calisthenics')
  const actualCategory = plan.category || plan.routine_id;
  const routineDetails = WORKOUT_DB.find(w => 
    w.category === actualCategory && w.level === plan.level
  );

  const exercises = routineDetails ? routineDetails.exercises : [];

  // Countdown Logic
  useEffect(() => {
    let interval: any;
    if (phase === 'countdown' && countdown > 0) {
      playTickSound();
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (phase === 'countdown' && countdown === 0) {
      playSuccessSound();
      setPhase('active');
    }
    return () => clearInterval(interval);
  }, [phase, countdown]);

  const handleFinish = async () => {
    // Optional: Save completion to daily logs
    if (user) {
       await logDailyStatus(user.id, 'workout');
    }
    onComplete(); // go back home
  };

  if (phase === 'countdown') {
    return (
      <div className={styles.container}>
        <div className={styles.countdownScreen}>
          <h2>PREPÁRATE</h2>
          <div className={styles.countdownNumber}>{countdown}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <header className={styles.header}>
        <button onClick={onComplete} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <span className={styles.planTitle}>{plan.routine_id.toUpperCase()} - {plan.level}</span>
      </header>

      {/* Exercise List */}
      <div className={styles.exerciseListContainer}>
        <h3 className={styles.sectionTitle}>Tus Ejercicios</h3>
        <ul className={styles.exerciseList}>
          {exercises.map((ex, idx) => (
            <li key={idx} className={styles.exerciseItem}>
              <div className={styles.exInfo}>
                <span className={styles.exName}>{ex.name}</span>
                <span className={styles.exMeta}>
                  {ex.sets && `${ex.sets} SERIES`} {ex.reps && `• ${ex.reps}`} {ex.tiempo && `• ${ex.tiempo}`}
                </span>
                <button 
                  className={styles.completeSetBtn}
                  onClick={() => setActiveRestTime(ex.rest || 60)}
                >
                  ✓ Serie completada
                </button>
              </div>
              <div className={styles.exRest}>
                {ex.rest}s rest
              </div>
            </li>
          ))}
          {exercises.length === 0 && (
            <p style={{ color: 'var(--secondary-text)' }}>No se encontraron detalles para {plan.routine_id} - {plan.level}</p>
          )}
        </ul>
      </div>

      {/* Flotante Descanso */}
      {activeRestTime !== null && (
        <TrainingTimer 
          initialSeconds={activeRestTime} 
          onFinished={() => setActiveRestTime(null)} 
        />
      )}

      {/* Footer action */}
      <footer className={styles.footer}>
        <button className={styles.finishBtn} onClick={handleFinish}>
          <Square size={20} fill="currentColor" />
          FINALIZAR ENTRENAMIENTO
        </button>
      </footer>
    </div>
  );
}
