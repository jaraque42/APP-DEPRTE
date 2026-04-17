"use client";

import React, { useState, useEffect } from 'react';
import styles from './AddFoodModal.module.css';
import { searchFoodLibrary, addFoodToLibrary } from '@/services/supabaseService';
import { useRef } from 'react';


interface FoodItem {
  id: string;
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  unit?: 'g' | 'ud';
}


export default function AddFoodModal({ onAddFood, onClose }: { onAddFood: (food: any) => void, onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState<number>(100);
  const [mealType, setMealType] = useState<string>("otros");
  const [isFocused, setIsFocused] = useState(false);
  const [isCreatingFood, setIsCreatingFood] = useState(false);
  const [newFoodForm, setNewFoodForm] = useState({ name: "", kcal_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 });
  const gramsInputRef = useRef<HTMLInputElement>(null);

  // Sugerencia inteligente de tiempo de comida
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setMealType("desayuno");
    else if (hour >= 11 && hour < 16) setMealType("comida");
    else if (hour >= 16 && hour < 20) setMealType("merienda");
    else if (hour >= 20 || hour < 2) setMealType("cena");
    else setMealType("otros");
  }, []);


  // Auto-focus en los gramos al seleccionar alimento
  useEffect(() => {
    if (selectedFood) {
      setTimeout(() => gramsInputRef.current?.focus(), 100);
    }
  }, [selectedFood]);


  // Búsqueda en tiempo real (debounced)
  useEffect(() => {
    const fetchFoods = async () => {
      if (searchTerm.length >= 2 || (isFocused && searchTerm.length === 0)) {
        try {
          const res = await searchFoodLibrary(searchTerm);
          setResults(res as FoodItem[]);
        } catch (e) {
          console.error(e);
        }
      } else {
        setResults([]);
        setSelectedFood(null);
      }
    };
    
    const timeout = setTimeout(fetchFoods, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, isFocused]);

  const calculateTotal = (valPer100: number) => Math.round((valPer100 * grams) / 100);

  // Helper macro dominancia tip (azul: proteina, amarillo: grasa)
  const getDominantMacroClass = (f: FoodItem) => {
      const { p, c, fat } = { p: f.protein_per_100g || 0, c: f.carbs_per_100g || 0, fat: f.fat_per_100g || 0 };
      if (p > c && p > fat) return styles.macroProtein;
      if (fat > p && fat > c) return styles.macroFat;
      return "";
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
            <h2 className={styles.title}>Añadir Alimento</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.inputWrapper}>
          <input 
            type="text"
            placeholder="Ej. Pechuga de pollo..."
            className={styles.searchInput}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        <div className={styles.resultsList}>
          {results.map(food => (
            <button 
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className={`
                ${styles.foodItem} 
                ${getDominantMacroClass(food)}
                ${selectedFood?.id === food.id ? styles.selected : ''}
              `}
            >
              <div className={styles.foodInfo}>
                <p className={styles.foodName}>{food.name}</p>
                <p className={styles.foodMacros}>
                  {food.kcal_per_100g} kcal / 100{food.unit || 'g'} • {food.protein_per_100g}g P / {food.carbs_per_100g}g C / {food.fat_per_100g}g G
                </p>
              </div>
              <span className={styles.addButton}>{selectedFood?.id === food.id ? '✓' : '+'}</span>
            </button>

          ))}

          {searchTerm.length >= 2 && results.length === 0 && !isCreatingFood && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ color: 'var(--secondary-text)', marginBottom: '12px' }}>No lo hemos encontrado 🕵️‍♂️</p>
              <button 
                className={styles.confirmBtn} 
                style={{ backgroundColor: 'var(--accent)', color: '#000', fontSize: '0.875rem', padding: '12px' }}
                onClick={() => {
                  setIsCreatingFood(true);
                  setNewFoodForm({ ...newFoodForm, name: searchTerm });
                  setSelectedFood(null);
                }}
              >
                + Añadir a la Base de Datos
              </button>
            </div>
          )}
        </div>

        {isCreatingFood && (
          <div className={styles.selectedFoodBlock} style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Crear Alimento Global</h3>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Los valores siempre deben ser por cada <strong>100g</strong> (o 1 unidad).
            </p>

            <div className={styles.inputGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.inputLabel}>Nombre</label>
              <input 
                type="text" 
                value={newFoodForm.name}
                onChange={e => setNewFoodForm({...newFoodForm, name: e.target.value})}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.selectedGrid} style={{ marginBottom: '12px' }}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Kcal (100g)</label>
                <input 
                  type="number" 
                  value={newFoodForm.kcal_per_100g || ''}
                  onChange={e => setNewFoodForm({...newFoodForm, kcal_per_100g: Number(e.target.value)})}
                  className={styles.numberInput} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Prot (g)</label>
                <input 
                  type="number" 
                  value={newFoodForm.protein_per_100g || ''}
                  onChange={e => setNewFoodForm({...newFoodForm, protein_per_100g: Number(e.target.value)})}
                  className={styles.numberInput} 
                />
              </div>
            </div>

            <div className={styles.selectedGrid} style={{ marginBottom: '24px' }}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Carbos (g)</label>
                <input 
                  type="number" 
                  value={newFoodForm.carbs_per_100g || ''}
                  onChange={e => setNewFoodForm({...newFoodForm, carbs_per_100g: Number(e.target.value)})}
                  className={styles.numberInput} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Grasas (g)</label>
                <input 
                  type="number" 
                  value={newFoodForm.fat_per_100g || ''}
                  onChange={e => setNewFoodForm({...newFoodForm, fat_per_100g: Number(e.target.value)})}
                  className={styles.numberInput} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                  className={styles.confirmBtn}
                  style={{ backgroundColor: 'var(--card-bg)', color: '#fff', border: '1px solid var(--border-color)', flex: 0.5 }}
                  onClick={() => setIsCreatingFood(false)}
              >
                Cancelar
              </button>
              <button 
                  className={styles.confirmBtn}
                  disabled={!newFoodForm.name || !newFoodForm.kcal_per_100g}
                  style={{ flex: 1 }}
                  onClick={async () => {
                    try {
                      const created = await addFoodToLibrary(newFoodForm);
                      setIsCreatingFood(false);
                      setSearchTerm(created.name);
                      setSelectedFood({
                        id: created.id,
                        name: created.name,
                        kcal_per_100g: Number(created.kcal_per_100g),
                        protein_per_100g: Number(created.protein_per_100g),
                        carbs_per_100g: Number(created.carbs_per_100g),
                        fat_per_100g: Number(created.fat_per_100g),
                        unit: 'g'
                      });
                    } catch (e) {
                      console.error("Error creating food", e);
                    }
                  }}
              >
                Compartir y Guardar
              </button>
            </div>
          </div>
        )}

        {selectedFood && !isCreatingFood && (
          <div className={styles.selectedFoodBlock}>
            <p className={styles.inputLabel}>¿Cuándo lo has comido?</p>
            <div className={styles.mealSelector}>
              {['desayuno', 'comida', 'cena', 'merienda', 'otros'].map(type => (
                <button 
                  key={type}
                  className={`${styles.mealOption} ${mealType === type ? styles.mealOptionActive : ''}`}
                  onClick={() => setMealType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.selectedGrid}>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>{selectedFood.unit === 'ud' ? 'Unidades' : 'Gramos'}</label>
                <input 
                    ref={gramsInputRef}
                    type="number" 
                    placeholder="100" 
                    value={grams}
                    onChange={(e) => setGrams(Number(e.target.value))}
                    className={styles.numberInput} 
                />
              </div>

              <div className={styles.totalGroup}>
                <p className={styles.inputLabel}>Total</p>
                <p className={styles.totalValue}>{calculateTotal(selectedFood.kcal_per_100g)} kcal</p>
              </div>
            </div>
            
            <button 
                className={styles.confirmBtn}
                onClick={() => {
                    onAddFood({ 
                      food: selectedFood, 
                      grams, 
                      mealType,
                      totalKcal: calculateTotal(selectedFood.kcal_per_100g) 
                    });
                    onClose();
                }}
            >

              ¡A la saca! ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
