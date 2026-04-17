"use client";

import React, { useEffect, useState } from "react";
import styles from "./ProgressWidget.module.css";
import { ChevronRight } from "lucide-react";
import { getTodayConsumption } from "@/services/supabaseService";
import { useAuth } from "@/components/auth/AuthContext";


export default function ProgressWidget() {
  const { userDoc } = useAuth();
  const [consumptionKcal, setConsumptionKcal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
        const data = await getTodayConsumption();
        setConsumptionKcal(data.kcal);
    };
    fetch();
  }, []);

  const caloriesGoal = userDoc?.target_kcal || 2000;
  const progress = Math.min(100, (consumptionKcal / caloriesGoal) * 100);


  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.widgetContainer}>
      <h3 className={styles.widgetTitle}>Resumen Diario</h3>

      <div className={styles.chartWrapper}>
        <svg className={styles.chart} width="160" height="160" viewBox="0 0 160 160">
          <circle
            className={styles.circleBg}
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="12"
          />
          <circle
            className={styles.circleProgress}
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className={styles.chartInfo}>
          <span className={styles.chartValue}>{consumptionKcal}</span>
          <span className={styles.chartLabel}>kcal ingeridas</span>
        </div>
      </div>
      
      <p className={styles.chartDesc}>
        {consumptionKcal >= caloriesGoal 
          ? <strong>¡Meta alcanzada! 🔥</strong>
          : <>Faltan <strong>{caloriesGoal - consumptionKcal} kcal</strong> para tu meta.</>
        }
      </p>


      <div className={styles.nextTask}>
        <h4 className={styles.taskTitle}>Próxima Tarea</h4>
        <div className={styles.taskCard}>
          <div className={styles.taskMeta}>
            <span className={styles.taskName}>Merienda</span>
            <span className={styles.taskTime}>16:30 hrs</span>
          </div>
          <ChevronRight size={20} className={styles.taskIcon} />
        </div>
      </div>
    </div>
  );
}
