import * as actions from '@/actions/dbActions';

// Switch para pruebas locales sin backend real
const IS_MOCK_MODE = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

// Helper para persistencia local del Mock
const getLocal = (key: string) => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`fit_mock_${key}`);
    return data ? JSON.parse(data) : null;
};

const setLocal = (key: string, val: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`fit_mock_${key}`, JSON.stringify(val));
};

let mockUser: any = getLocal('user');
let mockUserDoc: any = getLocal('user_doc');
let mockFoodLogs: any[] = getLocal('food_logs') || [];
let mockWorkoutPlans: any[] = getLocal('workout_plans') || [];
let mockSubscription: ((event: string, session: any) => void) | null = null;


const triggerMockAuthChange = (event: string) => {
  if (mockSubscription) {
    mockSubscription(event, mockUser ? { user: mockUser } : null);
  }
};

import { getSession, signOut } from 'next-auth/react';

export const getActiveUser = async () => {
  if (IS_MOCK_MODE) return mockUser;
  const session = await getSession();
  return session?.user || null;
};



export const getUserDoc = async () => {
  if (IS_MOCK_MODE) return mockUserDoc;
  const user = await getActiveUser();
  if (!user) return null;
  try {
      return await actions.getMongoUserDoc(user.id);
  } catch (e) {
      return null;
  }
};

export const finishOnboardingData = async (formData: any) => {
  // 1. Calcular TDEE
  const w = parseFloat(formData.weight_kg);
  const h = parseFloat(formData.height_cm);
  const a = parseInt(formData.age);
  const g = formData.gender;
  let bmr = g === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  let tdee = bmr * formData.activity_level;

  let target_kcal = formData.targetKcal;
  if (!target_kcal) {
    target_kcal = tdee;
    if (formData.goal === 'fat_loss') target_kcal -= 500;
    if (formData.goal === 'muscle_gain') target_kcal += 300;
    target_kcal = Math.round(target_kcal);
  }

  const p = Math.round((w * 2.2));
  const f = Math.round((w * 1));
  const c = Math.round((target_kcal - (p * 4) - (f * 9)) / 4);

  if (IS_MOCK_MODE) {
    mockUserDoc = {
        ...mockUserDoc,
        age: formData.age,
        weight_kg: formData.weight_kg,
        height_cm: formData.height_cm,
        gender: formData.gender,
        activity_level: formData.activity_level,
        goal_type: formData.goal,
        onboarding_complete: true,
        target_kcal: target_kcal,
        target_protein: p,
        target_carbs: c,
        target_fats: f
    };
    setLocal('user_doc', mockUserDoc);

    // Sobreescribir plan de entreno
    if (formData.routineDays && formData.routineDays.length > 0) {
      mockWorkoutPlans = [{
        id: `custom_plan_${Date.now()}`,
        routine_id: formData.routineCategory,
        category: formData.routineCategory.toLowerCase(),
        level: formData.routineLevel,
        days: formData.routineDays,
        duration_weeks: 4,
        created_at: new Date().toISOString()
      }];
      setLocal('workout_plans', mockWorkoutPlans);
    }
    
    triggerMockAuthChange('USER_UPDATED'); 
    return;
  }

  const user = await getActiveUser();
  if (!user) throw new Error("No user");

  const profileData = { 
      age: formData.age,
      weight_kg: formData.weight_kg,
      height_cm: formData.height_cm,
      gender: formData.gender,
      activity_level: formData.activity_level,
      goal_type: formData.goal,
      target_kcal: target_kcal,
      target_protein: p,
      target_carbs: c,
      target_fats: f,
      onboarding_complete: true,
      routineDays: formData.routineDays,
      routineCategory: formData.routineCategory,
      routineLevel: formData.routineLevel
  };

  await actions.finishMongoOnboarding(user.id, profileData);
  return true;
};

export const updateUserMacros = async (macros: { kcal: number, p: number, c: number, f: number }) => {
  if (IS_MOCK_MODE) {
    mockUserDoc = {
      ...mockUserDoc,
      target_kcal: macros.kcal,
      target_protein: macros.p,
      target_carbs: macros.c,
      target_fats: macros.f
    };
    setLocal('user_doc', mockUserDoc);
    triggerMockAuthChange('USER_UPDATED');
    return { success: true };
  }

  const user = await getActiveUser();
  if (!user) throw new Error("No user");

  await actions.updateMongoUserMacros(user.id, { kcal: macros.kcal, p: macros.p, c: macros.c, f: macros.f });
  return true;
};

export const handleLogout = async () => {
  if (IS_MOCK_MODE) {
    mockUser = null;
    mockUserDoc = null;
    mockFoodLogs = [];
    mockWorkoutPlans = [];
    localStorage.removeItem('fit_mock_user');
    localStorage.removeItem('fit_mock_user_doc');
    localStorage.removeItem('fit_mock_food_logs');
    localStorage.removeItem('fit_mock_workout_plans');
    triggerMockAuthChange('SIGNED_OUT');
    return;
  }
  await signOut({ redirect: false });
};


// --- SERVICIOS DE NUTRICIÓN (LOGS) ---

export const logFoodEntry = async (food: any, amount: number, meal_type: string = 'otros') => {
  const user = await getActiveUser();
  if (!user) throw new Error("No authenticated user");

  const kcal_total = Math.round((food.kcal_per_100g * amount) / 100);
  const p_total = (food.protein_per_100g * amount) / 100;
  const c_total = (food.carbs_per_100g * amount) / 100;
  const f_total = (food.fat_per_100g * amount) / 100;

  if (IS_MOCK_MODE) {
    mockFoodLogs.push({
      kcal_total, p_total, c_total, f_total, meal_type,
      food_name: food.name, // Guardamos el nombre real seleccionado
      log_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    });
    setLocal('food_logs', mockFoodLogs);
    return { success: true };
  }

  await actions.logMongoFoodEntry(user.id, food, amount, meal_type);
  return { success: true };
};

export const getTodayConsumption = async () => {
  const user = await getActiveUser();
  if (!user) return { kcal: 0, p: 0, c: 0, f: 0 };

  if (IS_MOCK_MODE) {
    return mockFoodLogs.reduce((acc, log) => ({
      kcal: acc.kcal + log.kcal_total,
      p: acc.p + log.p_total,
      c: acc.c + log.c_total,
      f: acc.f + log.f_total
    }), { kcal: 0, p: 0, c: 0, f: 0 });
  }

  try {
      return await actions.getMongoDailyConsumption(user.id);
  } catch (e) {
      return { kcal: 0, p: 0, c: 0, f: 0 };
  }
};

export const getDetailedFoodLogs = async () => {
  const user = await getActiveUser();
  if (!user) return [];

  if (IS_MOCK_MODE) {
    // Simulamos el join en el modo mock
    return mockFoodLogs.map((log, i) => ({
      ...log,
      id: `log-${i}`,
      food_library: {
        name: log.food_name || (log.kcal_total > 200 ? 'Pechuga de Pollo' : 'Arroz Integral')
      }
    }));
  }


  try {
      return await actions.getMongoDetailedFoodLogs(user.id);
  } catch(e) {
      return [];
  }
};

export const deleteFoodEntry = async (logId: string) => {
  const user = await getActiveUser();
  if (!user) throw new Error("No authenticated user");

  if (IS_MOCK_MODE) {
    const idx = mockFoodLogs.findIndex((_, i) => `log-${i}` === logId);
    if (idx >= 0) mockFoodLogs.splice(idx, 1);
    setLocal('food_logs', mockFoodLogs);
    return { success: true };
  }

  return await actions.deleteMongoFoodEntry(user.id, logId);
};


// ... resto de funciones se mantienen iguales ...



export const saveWorkoutPlan = async (routineId: string, category: string, level: string, daysOfWeek: string[], durationWeeks: number) => {
  const user = await getActiveUser();
  if (!user) throw new Error("No authenticated user");

  const planData = {
    id: routineId + '_' + Date.now(),
    routine_id: routineId,
    category,
    level,
    days: daysOfWeek,
    duration_weeks: durationWeeks,
    created_at: new Date().toISOString()
  };

  if (IS_MOCK_MODE) {
    mockWorkoutPlans.push(planData);
    setLocal('workout_plans', mockWorkoutPlans);
    return { success: true };
  }

  await actions.saveMongoWorkoutPlan(user.id, planData);
  return { success: true };
};

export const getWorkoutPlan = async () => {
  const user = await getActiveUser();
  if (!user) return [];

  if (IS_MOCK_MODE) {
    return mockWorkoutPlans || [];
  }

  try {
      return await actions.getMongoWorkoutPlans(user.id);
  } catch (e) {
      return [];
  }
};

let mockFoodLibrary: any[] = [
    { id: 'f1', name: 'Pechuga de Pollo', kcal_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, unit: 'g' },
    { id: 'f2', name: 'Arroz Integral', kcal_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, unit: 'g' },
    { id: 'f3', name: 'Huevo Entero', kcal_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, unit: 'ud' },
    { id: 'f4', name: 'Avena', kcal_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9, unit: 'g' },
    { id: 'f5', name: 'Plátano', kcal_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3, unit: 'ud' },
    { id: 'f6', name: 'Aceite de Oliva', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, unit: 'g' }
];

export const searchFoodLibrary = async (query: string) => {
  if (IS_MOCK_MODE) {
     if (!query || query.trim().length === 0) return mockFoodLibrary.slice(0, 10);
     return mockFoodLibrary.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }
  
  return await actions.searchMongoFoodLibrary(query);
};

export const addFoodToLibrary = async (food: { name: string, kcal_per_100g: number, protein_per_100g: number, carbs_per_100g: number, fat_per_100g: number, unit?: string }) => {
  const newFood = {
    ...food,
    unit: food.unit || 'g',
  };

  if (IS_MOCK_MODE) {
    const customFood = { id: `custom_${Date.now()}`, ...newFood };
    mockFoodLibrary.unshift(customFood);
    return customFood;
  }

  return await actions.addMongoFoodToLibrary(newFood);
};

let mockDailyLogs: any[] = [];

export const logDailyStatus = async (userId: string, type: 'diet' | 'workout') => {
  const today = new Date().toISOString().split('T')[0];
  if (IS_MOCK_MODE) {
    const existing = mockDailyLogs.find(l => l.log_date === today);
    if (!existing) mockDailyLogs.push({ log_date: today, status: 'perfect' });
    return { status: 'ok' };
  }
  return await actions.logMongoDailyStatus(userId);
};

export const getWeeklyLogs = async () => {
  const user = await getActiveUser();
  if (!user && !IS_MOCK_MODE) return [];

  // Definir últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  if (IS_MOCK_MODE) {
    return last7Days.map(dateStr => {
      const log = mockDailyLogs.find(l => l.log_date === dateStr);
      return { log_date: dateStr, status: log ? log.status : 'none' };
    });
  }

  try {
      return await actions.getMongoWeeklyLogs(user.id);
  } catch(e) {
      return [];
  }
};

export const syncOfflineAction = async (actionName: string, payload: any) => {
  if (navigator.onLine) return { success: true, offline: false };
  return { success: true, offline: true };
};

export const processOfflineQueue = async () => {};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  if (IS_MOCK_MODE) {
    mockSubscription = callback;
    // Disparo inicial para liberar el estado de carga
    callback('INITIAL_SESSION', mockUser ? { user: mockUser } : null);
    return { data: { subscription: { unsubscribe: () => { mockSubscription = null; } } } };
  }
  // In NextAuth we don't need this listener manually as SessionProvider handles it
  return { data: { subscription: { unsubscribe: () => {} } } };
};

