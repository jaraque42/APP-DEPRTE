"use client";

import React, { useEffect, useState } from "react";
import styles from "./DietPage.module.css";
import { getTodayConsumption, getDetailedFoodLogs, logFoodEntry, deleteFoodEntry } from "@/services/supabaseService";
import { useAuth } from "@/components/auth/AuthContext";
import { Apple, Plus, Utensils, Settings, Trash2 } from "lucide-react";
import AddFoodModal from "@/components/dashboard/AddFoodModal";
import AdjustMacrosModal from "./AdjustMacrosModal";

export default function DietPage() {
  const { userDoc } = useAuth();
  const [consumption, setConsumption] = useState({ kcal: 0, p: 0, c: 0, f: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, lData] = await Promise.all([
        getTodayConsumption(),
        getDetailedFoodLogs()
      ]);
      setConsumption(cData);
      setLogs(lData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupLogsByMeal = () => {
    const order = ['desayuno', 'comida', 'merienda', 'cena', 'otros'];
    const groups: Record<string, { logs: any[], totalKcal: number, icon: string }> = {
      desayuno: { logs: [], totalKcal: 0, icon: '🍳' },
      comida: { logs: [], totalKcal: 0, icon: '🍛' },
      merienda: { logs: [], totalKcal: 0, icon: '🍎' },
      cena: { logs: [], totalKcal: 0, icon: '🥗' },
      otros: { logs: [], totalKcal: 0, icon: '🥨' }
    };

    logs.forEach(log => {
      const type = log.meal_type || 'otros';
      if (groups[type]) {
        groups[type].logs.push(log);
        groups[type].totalKcal += log.kcal_total;
      }
    });

    return order.filter(t => groups[t].logs.length > 0).map(t => ({
      type: t,
      ...groups[t]
    }));
  };

  const groupedLogs = groupLogsByMeal();

  return (
    <div className={styles.dietPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nutrición</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={styles.addBtn} 
            style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--secondary-text)' }}
            onClick={() => setIsAdjustModalOpen(true)}
          >
            <Settings size={20} />
          </button>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            <span>Añadir</span>
          </button>
        </div>
      </header>

      {/* Resumen de Macros */}
      <section className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Calorías</span>
          <span className={`${styles.cardValue} ${styles.kcal}`}>{consumption.kcal} / {userDoc?.target_kcal || '---'}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Proteína</span>
          <span className={`${styles.cardValue} ${styles.p}`}>{Math.round(consumption.p)}g / {userDoc?.target_protein || '---'}g</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Carbs</span>
          <span className={`${styles.cardValue} ${styles.c}`}>{Math.round(consumption.c)}g / {userDoc?.target_carbs || '---'}g</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Grasas</span>
          <span className={`${styles.cardValue} ${styles.f}`}>{Math.round(consumption.f)}g / {userDoc?.target_fats || '---'}g</span>
        </div>
      </section>

      {/* Listado de Logs Agrupados */}
      <section className={styles.historySection}>
        <h2 className={styles.sectionTitle}>
          <span>Historial de Hoy</span>
          <Utensils size={18} color="var(--secondary-text)" />
        </h2>

        {groupedLogs.length > 0 ? (
          <div className={styles.timeline}>
            {groupedLogs.map((group) => (
              <div key={group.type} className={styles.mealGroup}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupTitle}>
                    <span className={styles.groupIcon}>{group.icon}</span>
                    <span>{group.type}</span>
                  </div>
                  <span className={styles.groupKcal}>{group.totalKcal} kcal</span>
                </div>
                <div className={styles.logsList}>
                  {group.logs.map((log) => (
                    <div key={log.id || log._id} className={styles.logItem}>
                      <div className={styles.logMainInfo}>
                        <span className={styles.itemName}>{log.food_library?.name || log.food_name || 'Alimento'}</span>
                        <span className={styles.itemMeta}>{log.amount} {log.food_library?.unit || 'g'} • {new Date(log.created_at || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={styles.logActions}>
                        <div className={styles.logMacros}>
                          <span className={styles.itemKcal}>{Math.round(log.kcal_total)} kcal</span>
                          <span className={styles.itemMacrosShort}>
                            {Math.round(log.p_total)}P {Math.round(log.c_total)}C {Math.round(log.f_total)}F
                          </span>
                        </div>
                        <button 
                          className={styles.deleteBtn}
                          onClick={async () => {
                            try {
                              await deleteFoodEntry(log.id || log._id);
                              await fetchData();
                            } catch(e) {
                              console.error('Error deleting entry', e);
                            }
                          }}
                          title="Eliminar entrada"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Apple size={48} color="var(--border-color)" strokeWidth={1} />
            <p className={styles.emptyText}>No has registrado alimentos todavía.</p>
          </div>
        )}
      </section>

      {isModalOpen && (
        <AddFoodModal 
          onClose={() => setIsModalOpen(false)}
          onAddFood={async ({ food, grams, mealType }) => {
            try {
              await logFoodEntry(food, grams, mealType);
              await fetchData();
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      {isAdjustModalOpen && (
        <AdjustMacrosModal onClose={() => setIsAdjustModalOpen(false)} />
      )}
    </div>
  );
}

