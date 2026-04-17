export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  tiempo?: string;
  rest?: number; // en segundos
}

export interface WorkoutLevelDetails {
  name: string;
  category: string;
  level: string; // 'principiante', 'basico', 'intermedio', 'atleta'
  description: string;
  exercises: Exercise[];
}

export const WORKOUT_DB: WorkoutLevelDetails[] = [
  // ==========================
  // 1. FUERZA
  // ==========================
  {
    name: "Fuerza Adaptación",
    category: "strength",
    level: "Principiante",
    description: "Adaptación inicial. Centrado en técnica e hipertrofia básica.",
    exercises: [
      { name: "Sentadilla Goblet", sets: 3, reps: "12", rest: 60 },
      { name: "Press Banca con Mancuernas", sets: 3, reps: "12", rest: 60 },
      { name: "Peso Muerto Rumano (Poco Peso)", sets: 3, reps: "15", rest: 60 }
    ]
  },
  {
    name: "Fuerza Fundamentos",
    category: "strength",
    level: "Básico",
    description: "Construcción de masa y fuerza con movimientos compuestos.",
    exercises: [
      { name: "Sentadilla con Barra", sets: 4, reps: "8-10", rest: 90 },
      { name: "Press Militar", sets: 4, reps: "8", rest: 90 },
      { name: "Remo con Barra", sets: 4, reps: "10", rest: 90 }
    ]
  },
  {
    name: "Fuerza Volumen PPL",
    category: "strength",
    level: "Intermedio",
    description: "Esquemas de 4 días (Push/Pull/Legs) y variaciones de potencia.",
    exercises: [
      { name: "Press Banca (Día Push)", sets: 4, reps: "6-8", rest: 120 },
      { name: "Dominadas Lastradas (Día Pull)", sets: 4, reps: "6", rest: 120 },
      { name: "Prensa Inclinada (Día Legs)", sets: 4, reps: "10", rest: 90 }
    ]
  },
  {
    name: "Fuerza Máximo Rendimiento",
    category: "strength",
    level: "Atleta",
    description: "Levantamientos olímpicos y esquemas de alta intensidad (5x5, 3x1)",
    exercises: [
      { name: "Clean & Jerk", sets: 5, reps: "3", rest: 150 },
      { name: "Sentadilla Pesada (5x5)", sets: 5, reps: "5", rest: 180 },
      { name: "Peso Muerto Máximo", sets: 3, reps: "1", rest: 240 }
    ]
  },

  // ==========================
  // 2. CALISTENIA
  // ==========================
  {
    name: "Calistenia Iniciación",
    category: "calisthenics",
    level: "Principiante",
    description: "Desarrollo de movilidad y control total del cuerpo.",
    exercises: [
      { name: "Flexiones Inclinadas", sets: 3, reps: "10-15", rest: 60 },
      { name: "Sentadillas al aire", sets: 3, reps: "20", rest: 60 },
      { name: "Plancha Abdominal", sets: 3, tiempo: "30s", rest: 45 },
      { name: "Dominadas con banda elástica", sets: 3, reps: "8", rest: 90 }
    ]
  },
  {
    name: "Calistenia Fundamentos",
    category: "calisthenics",
    level: "Básico",
    description: "Afianzando bases sólidas para ejercicios compuestos.",
    exercises: [
      { name: "Flexiones Estándar", sets: 4, reps: "12", rest: 60 },
      { name: "Zancadas", sets: 4, reps: "12/pierna", rest: 60 },
      { name: "Hollow Body Hold", sets: 4, tiempo: "45s", rest: 60 },
      { name: "Dominadas Negativas", sets: 3, reps: "5", rest: 90 }
    ]
  },
  {
    name: "Calistenia Avanzada",
    category: "calisthenics",
    level: "Intermedio",
    description: "Explosividad y tensión constante.",
    exercises: [
      { name: "Dips (Fondos en paralelas)", sets: 4, reps: "10", rest: 90 },
      { name: "Flexiones en Diamante", sets: 4, reps: "12", rest: 60 },
      { name: "Dominadas Explosivas", sets: 4, reps: "8", rest: 120 },
      { name: "L-sit", sets: 3, tiempo: "15s", rest: 60 }
    ]
  },
  {
    name: "Calistenia Élite",
    category: "calisthenics",
    level: "Atleta",
    description: "Control total y fuerza estática del más alto nivel.",
    exercises: [
      { name: "Muscle-up", sets: 4, reps: "5", rest: 120 },
      { name: "HSPU (Flexiones haciendo pino)", sets: 4, reps: "6", rest: 120 },
      { name: "Dominadas a una mano", sets: 3, reps: "2/brazo", rest: 150 },
      { name: "Front Lever", sets: 3, tiempo: "10s", rest: 120 }
    ]
  },

  // ==========================
  // 3. KETTLEBELL & CARDIO (Usado para ambos)
  // ==========================
  {
    name: "Híbrido Metabólico Inicial",
    category: "kettlebell", // and cardio
    level: "Principiante",
    description: "Enfoque en resistencia metabólica y movilidad.",
    exercises: [
      { name: "Kettlebell Swings (2 manos)", sets: 3, reps: "15", rest: 45 },
      { name: "Halo (movilidad hombro)", sets: 3, reps: "10", rest: 30 },
      { name: "Caminata rápida", sets: 1, tiempo: "15 min", rest: 0 }
    ]
  },
  {
    name: "Híbrido Potencia",
    category: "kettlebell", // and cardio
    level: "Básico",
    description: "Fusión de fuerza unilateral y cardio explosivo.",
    exercises: [
      { name: "Clean & Press (un brazo)", sets: 4, reps: "8/brazo", rest: 60 },
      { name: "Goblet Squat", sets: 4, reps: "12", rest: 60 },
      { name: "Intervalos de carrera (Sprints)", sets: 5, tiempo: "30s Trabajo / 30s Descanso", rest: 0 }
    ]
  },
  {
    name: "Kettlebell Power",
    category: "kettlebell", // and cardio
    level: "Intermedio",
    description: "Potencia explosiva y quema de grasa.",
    exercises: [
      { name: "KB Snatch", sets: 5, reps: "12/brazo", rest: 60 },
      { name: "Turkish Get-up", sets: 3, reps: "3/brazo", rest: 90 },
      { name: "Burpees", sets: 3, reps: "15", rest: 45 },
      { name: "Remo en máquina", sets: 1, reps: "1000m", rest: 0 }
    ]
  },
  {
    name: "Híbrido Élite",
    category: "kettlebell", // and cardio
    level: "Atleta",
    description: "Carrera de obstáculos y Double Kettlebell extrema.",
    exercises: [
      { name: "Double KB Clean & Jerk", sets: 5, reps: "8", rest: 90 },
      { name: "Windmill", sets: 4, reps: "6/lado", rest: 60 },
      { name: "HIIT Alta Intensidad / Pista", sets: 1, tiempo: "20 min", rest: 0 }
    ]
  }
];

// Reutilizamos el híbrido para cardio
WORKOUT_DB.push(...WORKOUT_DB.filter(w => w.category === 'kettlebell').map(w => ({...w, category: 'cardio'})));
