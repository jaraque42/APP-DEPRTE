"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./CalendarHeatmap.module.css";
import { format, subDays, addDays, getDay } from "date-fns";
import { es } from "date-fns/locale";

import { getWeeklyLogs } from "@/services/supabaseService";

export default function CalendarHeatmap() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [weekDays, setWeekDays] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const logs = await getWeeklyLogs();
      const arr = logs.map((log, index) => {
        // logs is sorted chronologically 7 days
        const d = new Date(log.log_date);
        return {
            dateObj: d,
            dayStr: format(d, 'eee', { locale: es }).slice(0, 3), 
            status: log.status || 'none',
            isToday: index === logs.length - 1
        };
      });
      setWeekDays(arr);
    };
    fetchLogs();
  }, []);

  return (
    <div className={styles.consistencyCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>Progreso Semanal</h3>
        <span className={styles.subtitle}>{format(new Date(), "MMMM yyyy", { locale: es })}</span>
      </div>
      
      {/* Contenedor desplazable de nodos */}
      <div className={styles.scrollContainer} ref={scrollRef}>
        <div className={styles.nodesWrapper}>
          {weekDays.map((day, idx) => (
            <div key={idx} className={styles.nodeItem}>
              <span className={styles.dayLabel}>{day.dayStr}</span>
              
              {/* Render del Nodito visual */}
              <div className={`
                ${styles.nodeCircle}
                ${day.status === 'perfect' ? styles.perfect : ''}
                ${day.status === 'partial' ? styles.partial : ''}
                ${day.status === 'none' && !day.isToday ? styles.missed : ''}
                ${day.isToday ? styles.todayBorder : ''}
              `}>
                {day.status === 'perfect' && (
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
