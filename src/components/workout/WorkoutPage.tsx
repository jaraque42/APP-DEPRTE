import React, { useState } from 'react';
import styles from './WorkoutPage.module.css';
import { Dumbbell, Flame, HeartPulse, ActivitySquare, ChevronRight, Play } from 'lucide-react';
import { WORKOUT_DB } from '@/data/workoutsData';

const workouts = [
  {
    id: 'calisthenics',
    title: 'Calistenia',
    description: 'Control corporal, fuerza funcional y core de acero.',
    image: '/workouts/calisthenics.png',
    icon: ActivitySquare,
    level: 'Intermedio-Avanzado',
    duration: '45-60 min'
  },
  {
    id: 'strength',
    title: 'Fuerza',
    description: 'Levantamientos pesados para hipertrofia y potencia máxima.',
    image: '/workouts/strength.png',
    icon: Dumbbell,
    level: 'Todos los niveles',
    duration: '60-90 min'
  },
  {
    id: 'cardio',
    title: 'Cardio Hiit',
    description: 'Quema de grasa acelerada, resistencia cardiovascular.',
    image: '/workouts/cardio.png',
    icon: HeartPulse,
    level: 'Todos los niveles',
    duration: '30-40 min'
  },
  {
    id: 'kettlebell',
    title: 'Kettlebell',
    description: 'Fuerza dinámica, agarre de hierro y movilidad explosiva.',
    image: '/workouts/kettlebell.png',
    icon: Flame,
    level: 'Intermedio',
    duration: '40-50 min'
  }
];

import { saveWorkoutPlan } from '@/services/supabaseService';

export default function WorkoutPage({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<{ workoutId: string, levelName: string } | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSavePlan = async (routineId: string, category: string, level: string) => {
    if (selectedDays.length === 0) return;
    setIsSaving(true);
    await saveWorkoutPlan(routineId, category, level, selectedDays, 4); // default 4 weeks
    setIsSaving(false);
    if (onNavigate) onNavigate('calendar');
  };


  return (
    <div className={styles.workoutContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Entrenamientos</h1>
          <p className={styles.subtitle}>Supera tus límites con rutinas diseñadas para resultados reales.</p>
        </div>
      </header>

      <div className={styles.grid}>
        {workouts.map((workout) => {
          const Icon = workout.icon;
          const isSelected = selectedWorkout === workout.id;
          const activeLevel = selectedLevel?.workoutId === workout.id ? selectedLevel.levelName : null;
          
          let bgClass = '';
          if (activeLevel === 'Principiante') bgClass = styles.bgGreen;
          else if (activeLevel === 'Básico') bgClass = styles.bgBlue;
          else if (activeLevel === 'Intermedio') bgClass = styles.bgPurple;
          else if (activeLevel === 'Atleta') bgClass = styles.bgRed;

          const routineLevels = WORKOUT_DB.filter(w => w.category === workout.id);
          const activeRoutineDetails = routineLevels.find(l => l.level === activeLevel);

          return (
            <div 
              key={workout.id} 
              className={`${styles.card} ${isSelected ? styles.active : ''} ${bgClass}`}
              onClick={() => {
                if (isSelected) {
                  setSelectedWorkout(null);
                  setSelectedLevel(null);
                  setIsPlanning(false);
                } else {
                  setSelectedWorkout(workout.id);
                  setSelectedLevel(null);
                  setIsPlanning(false);
                }
              }}
            >
              <div 
                className={styles.imageBackground} 
                style={{ backgroundImage: `url(${workout.image})` }}
              >
                <div className={styles.overlay}></div>
                <div className={styles.playButton}>
                  <Play fill="currentColor" size={20} />
                </div>
              </div>
              <div className={styles.content}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <Icon size={24} className={styles.icon} />
                  </div>
                  <div className={styles.tags}>
                    <span className={styles.tag}>{workout.duration}</span>
                  </div>
                </div>
                <h2 className={styles.cardTitle}>{workout.title}</h2>
                <p className={styles.cardDesc}>{workout.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.level}>{workout.level}</span>
                  <button className={styles.actionBtn}>
                    <span>{isSelected ? 'Ocultar' : 'Ver Niveles'}</span>
                    <ChevronRight size={16} className={isSelected ? styles.rotateIcon : ''} />
                  </button>
                </div>
                
                {isSelected && (
                  <div className={styles.levelsContainer} onClick={(e) => e.stopPropagation()}>
                    <h3 className={styles.levelsTitle}>Selecciona tu Nivel</h3>
                    <div className={styles.levelsGrid}>
                      {routineLevels.map((routine) => {
                        const isLevelActive = activeLevel === routine.level;
                        return (
                          <button 
                            key={routine.level} 
                            className={`${styles.levelBtn} ${isLevelActive ? styles.activeLevelBtn : ''}`}
                            onClick={() => {
                              setSelectedLevel({ workoutId: workout.id, levelName: routine.level });
                              setIsPlanning(false);
                            }}
                          >
                            <span>{routine.level}</span>
                            <Play size={14} className={styles.levelPlayIcon} />
                          </button>
                        );
                      })}
                    </div>

                    {activeRoutineDetails && (
                       <div className={styles.exercisesContainer}>
                         {!isPlanning ? (
                           <>
                             <div className={styles.detailsHeader}>
                               <div>
                                 <h4 className={styles.detailTitle}>{activeRoutineDetails.name}</h4>
                                 <p className={styles.detailDesc}>{activeRoutineDetails.description}</p>
                               </div>
                               <button className={styles.btnPrimary} onClick={() => setIsPlanning(true)}>
                                  Añadir a mi Programación
                               </button>
                             </div>
                             <ul className={styles.exerciseList}>
                               {activeRoutineDetails.exercises.map((ex, idx) => (
                                 <li key={idx} className={styles.exerciseItem}>
                                   <span className={styles.exName}>{ex.name}</span>
                                   <span className={styles.exMeta}>
                                      {ex.sets && `${ex.sets}x`}{ex.reps && `${ex.reps}`}{ex.tiempo && `${ex.tiempo}`} • {ex.rest}s rest
                                   </span>
                                 </li>
                               ))}
                             </ul>
                           </>
                         ) : (
                           <div className={styles.plannerForm}>
                              <h4 className={styles.detailTitle}>Programar: {activeRoutineDetails.name}</h4>
                              <p className={styles.detailDesc}>Selecciona los días que entrenarás esta rutina durante las próximas 4 semanas.</p>
                              
                              <div className={styles.daysSelector}>
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                                  <button 
                                    key={day} 
                                    className={`${styles.dayBtn} ${selectedDays.includes(day) ? styles.activeDay : ''}`}
                                    onClick={() => toggleDay(day)}
                                  >
                                    {day.substring(0, 2)}
                                  </button>
                                ))}
                              </div>

                              <div className={styles.plannerActions}>
                                <button className={styles.btnSecondary} onClick={() => setIsPlanning(false)}>Cancelar</button>
                                <button 
                                  className={styles.btnPrimary} 
                                  disabled={selectedDays.length === 0 || isSaving}
                                  onClick={() => handleSavePlan(workout.id, activeRoutineDetails.category, activeLevel)}
                                >
                                  {isSaving ? 'Guardando...' : 'Guardar y Ver Calendario'}
                                </button>
                              </div>
                           </div>
                         )}
                       </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
