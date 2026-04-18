"use client";

import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { syncOfflineAction, processOfflineQueue, logFoodEntry, getTodayConsumption, getWorkoutPlan, getDetailedFoodLogs } from "@/services/supabaseService";
import { Activity, Apple, WifiOff, LogOut, CalendarDays } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";


import CalendarHeatmap from "./CalendarHeatmap";
import AddFoodModal from "./AddFoodModal";
import AppointmentModal from "./AppointmentModal";

export default function Dashboard({ onStartWorkout }: { onStartWorkout?: (plan: any) => void }) {
  const { user, userDoc, logout } = useAuth();

  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [consumption, setConsumption] = useState({ kcal: 0, p: 0, c: 0, f: 0 });
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  
  const fetchDashboardData = async () => {
    const data = await getTodayConsumption();
    setConsumption(data);
    const logs = await getDetailedFoodLogs();
    setFoodLogs(logs);
    const plans = await getWorkoutPlan();
    setWorkoutPlans(Array.isArray(plans) ? plans : (plans ? [plans] : []));
  };

  
  // Track states for individual workouts
  const [workouts, setWorkouts] = useState([
    { id: "w_1", name: "Push Day", desc: "Pecho, Hombros y Tríceps • 45 MIN", loading: false, completed: false },
    { id: "w_2", name: "Cardio LISS", desc: "Caminadora • 20 MIN", loading: false, completed: false }
  ]);

  useEffect(() => {
    // Listen to network status
    const handleOnline = () => {
      setShowOfflineToast(false);
      processOfflineQueue();
    };
    window.addEventListener("online", handleOnline);
    
    fetchDashboardData();
    
    return () => window.removeEventListener("online", handleOnline);
  }, []);


  const handleCompleteWorkout = async (id: string, index: number) => {
    const updated = [...workouts];
    updated[index].loading = true;
    setWorkouts([...updated]);

    setTimeout(async () => {
      const result = await syncOfflineAction("workouts_progress", { workoutId: id, completedAt: new Date() });
      
      const doneList = [...workouts];
      doneList[index].loading = false;
      doneList[index].completed = true;
      setWorkouts([...doneList]);

      if (result?.offline) {
        setShowOfflineToast(true);
        setTimeout(() => setShowOfflineToast(false), 5000); 
      }
    }, 600);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
            <h1 className={styles.title}>Dashboard, {userDoc?.name || 'Atleta'}</h1>
            <p className={styles.subtitle}>Tu resumen para hoy</p>
        </div>
        <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Salir</span>
        </button>
      </header>


      <CalendarHeatmap />
      
      <section className={styles.dashboardGrid}>
        <div className={`${styles.card} ${styles.macroCard}`}>
          <div className={styles.circularProgress}>
            <span className={styles.kcalNumber}>
              {Math.max(0, (userDoc?.target_kcal || 0) - consumption.kcal) || '---'}
            </span>
            <span className={styles.kcalLabel}>kcal restantes</span>
          </div>
          <div className={styles.macroBars}>

            <div className={styles.barItem}>
              <span>P</span>
              <div className={styles.barBg}>
                <div 
                  className={`${styles.barFill} ${styles.pColor}`}
                  style={{ width: `${Math.min(100, (consumption.p / (userDoc?.target_protein || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className={styles.barItem}>
              <span>C</span>
              <div className={styles.barBg}>
                <div 
                  className={`${styles.barFill} ${styles.cColor}`}
                  style={{ width: `${Math.min(100, (consumption.c / (userDoc?.target_carbs || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className={styles.barItem}>
              <span>F</span>
              <div className={styles.barBg}>
                <div 
                  className={`${styles.barFill} ${styles.fColor}`}
                  style={{ width: `${Math.min(100, (consumption.f / (userDoc?.target_fats || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            
            <button 
              className={styles.addFoodMiniBtn}
              onClick={() => setIsFoodModalOpen(true)}
            >
              + Añadir
            </button>
          </div>
          
          {foodLogs.length > 0 && (
            <div className={styles.recentMeals}>
              <h4 className={styles.recentMealsTitle}>Comidas de hoy</h4>
              <ul className={styles.mealsList}>
                {foodLogs.slice(0, 3).map((log: any, idx: number) => (
                  <li key={idx} className={styles.mealItem}>
                    <span className={styles.mealName}>{log.food_library?.name || log.food_name || 'Comida'}</span>
                    <span className={styles.mealKcal}>{log.kcal_total} kcal</span>
                  </li>
                ))}
                {foodLogs.length > 3 && <li className={styles.mealItemMore}>+{foodLogs.length - 3} más...</li>}
              </ul>
            </div>
          )}
        </div>

        {(() => {
          const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          const todayIndex = new Date().getDay(); 
          const todayName = todayIndex === 0 ? 'Domingo' : daysOfWeek[todayIndex - 1];
          const plansForToday = workoutPlans.filter(p => p.days?.includes(todayName));

          return plansForToday.length > 0 ? (
            <>
              {plansForToday.map(plan => (
                <div key={plan.id} className={`${styles.card} ${styles.workoutCard}`}>
                  <span className={styles.tag}>ENTRENO DE HOY</span>
                  <h2>{plan.routine_id.toUpperCase()}</h2>
                  <p>Nivel: {plan.level} | Programado para {todayName}</p>
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => onStartWorkout && onStartWorkout(plan)}
                  >
                    Empezar ahora
                  </button>
                </div>
              ))}
            </>
          ) : (
            <div className={`${styles.card} ${styles.workoutCard} ${styles.restCard}`}>
              <span className={styles.tag}>HOY</span>
              <h2>Descanso Activo</h2>
              <p>Libre de entrenamiento programado</p>
              <button className={styles.btnPrimary} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>Hacer algo ligero</button>
            </div>
          );
        })()}
      </section>

      {/* Appointment Button */}
      <section className={styles.appointmentSection}>
        <button className={styles.appointmentBtn} onClick={() => setIsAppointmentOpen(true)}>
          <CalendarDays size={22} />
          <div>
            <span className={styles.appointmentTitle}>Solicitar Cita</span>
            <span className={styles.appointmentDesc}>Reserva una sesión con un profesional</span>
          </div>
        </button>
      </section>

      {isAppointmentOpen && (
        <AppointmentModal
          userName={userDoc?.name || user?.name || 'Atleta'}
          userEmail={user?.email || ''}
          onClose={() => setIsAppointmentOpen(false)}
        />
      )}

      {isFoodModalOpen && (
        <AddFoodModal 
          onClose={() => setIsFoodModalOpen(false)}
          onAddFood={async ({ food, grams, mealType }) => {
            try {
              await logFoodEntry(food, grams, mealType);
              await fetchDashboardData();
            } catch (e) {
              console.error("Error logging food", e);
            }
          }}
        />


      )}

      {showOfflineToast && (
        <div className={styles.syncToastContainer}>
          <WifiOff size={20} className={styles.syncIcon} />
          <span className={styles.syncText}>Sin red. Entrenamiento guardado. Se sincronizará automáticamente.</span>
        </div>
      )}
    </div>
  );
}
