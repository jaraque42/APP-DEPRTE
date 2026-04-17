import React, { useEffect, useState } from 'react';
import styles from './CalendarPage.module.css';
import { getWorkoutPlan } from '@/services/supabaseService';
import { Dumbbell, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export default function CalendarPage({ onStartWorkout }: { onStartWorkout?: (plan: any) => void }) {
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      const plans = await getWorkoutPlan();
      setWorkoutPlans(Array.isArray(plans) ? plans : (plans ? [plans] : []));
      setLoading(false);
    };
    fetchPlan();
  }, []);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Get current day of week in Spanish
  const todayIndex = new Date().getDay(); // 0 is Sunday
  const todayName = todayIndex === 0 ? 'Domingo' : daysOfWeek[todayIndex - 1];

  if (loading) {
    return (
      <div className={styles.calendarContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mi Calendario</h1>
        <p className={styles.subtitle}>Tu programación actual y progreso semanal.</p>
      </header>

      {workoutPlans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <CalendarIcon size={48} />
          </div>
          <h3>Sin plan activo</h3>
          <p>No tienes ninguna rutina programada. Ve a Entrenamiento para empezar.</p>
        </div>
      ) : (
        <div className={styles.planSection}>
          <div className={styles.planCard}>
            <div className={styles.planMeta}>PLANES ACTIVOS ({workoutPlans.length})</div>
            {workoutPlans.map(plan => (
              <h2 key={plan.id} className={styles.planTitle}>{plan.routine_id.toUpperCase()} - {plan.level}</h2>
            ))}
            <p className={styles.planDesc}>Tus configuraciones para las próximas semanas.</p>
          </div>

          <h3 className={styles.weekTitle}>Esta Semana</h3>
          <div className={styles.weekGrid}>
            {daysOfWeek.map(day => {
              const isToday = day === todayName;
              const plansForDay = workoutPlans.filter(p => p.days.includes(day));

              return (
                <div key={day} className={`${styles.dayCard} ${isToday ? styles.today : ''}`}>
                  <div className={styles.dayHeader}>
                    <span className={styles.dayName}>{day}</span>
                    {isToday && <span className={styles.todayBadge}>Hoy</span>}
                  </div>
                  
                  <div className={styles.dayContent}>
                    {plansForDay.length > 0 ? (
                      <div className={styles.multiplePlansBlock}>
                        {plansForDay.map(plan => (
                          <div key={plan.id} className={styles.trainingBlock}>
                             <div className={styles.trainingIcon}>
                               <Dumbbell size={18} />
                             </div>
                             <div className={styles.trainingInfo}>
                               <span className={styles.tLabel}>{plan.routine_id} - {plan.level}</span>
                               <button 
                                 className={styles.startBtn}
                                 onClick={() => onStartWorkout && onStartWorkout(plan)}
                               >
                                 Empezar
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.restBlock}>
                        <span className={styles.restLabel}>Descanso Activo / Libre</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
