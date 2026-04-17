-- 1. Habilitar la extensión de búsqueda fuzzy si se desea
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Crear tabla de perfiles (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  age INTEGER,
  weight_kg FLOAT,
  height_cm INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  activity_level FLOAT DEFAULT 1.2,
  goal_type TEXT CHECK (goal_type IN ('fat_loss', 'maintenance', 'muscle_gain')),
  target_kcal INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fats INTEGER,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de logs diarios
CREATE TABLE public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  weight_entry FLOAT,
  status TEXT CHECK (status IN ('perfect', 'partial', 'none')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 4. Crear tabla de biblioteca de alimentos
CREATE TABLE public.food_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  kcal_per_100g INTEGER NOT NULL,
  protein_per_100g FLOAT DEFAULT 0,
  carbs_per_100g FLOAT DEFAULT 0,
  fat_per_100g FLOAT DEFAULT 0,
  unit TEXT DEFAULT 'g', -- Nueva columna para soportar g / ud
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('spanish', name)) STORED
);

-- 4.5. Crear tabla de registros de alimentos consumidos
CREATE TABLE public.food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.food_library(id) ON DELETE SET NULL,
  amount FLOAT NOT NULL, -- En gramos o unidades según el alimento
  kcal_total INTEGER NOT NULL,
  p_total FLOAT DEFAULT 0,
  c_total FLOAT DEFAULT 0,
  f_total FLOAT DEFAULT 0,
  meal_type TEXT CHECK (meal_type IN ('desayuno', 'comida', 'cena', 'merienda', 'otros')),
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 5. Configurar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;


-- Políticas para Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para Daily Logs
CREATE POLICY "Users can handle own logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);

-- Políticas para Food Library (Lectura pública)
CREATE POLICY "Anyone can read food library" ON public.food_library FOR SELECT USING (true);

-- Políticas para Food Logs
CREATE POLICY "Users can handle own food logs" ON public.food_logs FOR ALL USING (auth.uid() = user_id);


-- 6. Función para calcular Macros (Mifflin-St Jeor)
CREATE OR REPLACE FUNCTION calculate_user_macros()
RETURNS TRIGGER AS $$
DECLARE
  bmr FLOAT;
  tdee FLOAT;
  adjustment INTEGER := 0;
BEGIN
  -- 1. Cálculo de BMR
  bmr := (10 * NEW.weight_kg) + (6.25 * NEW.height_cm) - (5 * NEW.age);
  IF NEW.gender = 'male' THEN
    bmr := bmr + 5;
  ELSE
    bmr := bmr - 161;
  END IF;

  -- 2. TDEE (Mantenimiento)
  tdee := bmr * NEW.activity_level;

  -- 3. Ajuste según objetivo
  IF NEW.goal_type = 'fat_loss' THEN
    adjustment := -500;
  ELSIF NEW.goal_type = 'muscle_gain' THEN
    adjustment := 300;
  END IF;

  NEW.target_kcal := ROUND(tdee + adjustment);
  -- Macro split simple: 30% P, 40% C, 30% F
  NEW.target_protein := ROUND((NEW.target_kcal * 0.30) / 4);
  NEW.target_carbs := ROUND((NEW.target_kcal * 0.40) / 4);
  NEW.target_fats := ROUND((NEW.target_kcal * 0.30) / 9);
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar el cálculo al insertar o actualizar
CREATE TRIGGER tr_calculate_macros
BEFORE INSERT OR UPDATE OF weight_kg, height_cm, age, gender, activity_level, goal_type
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION calculate_user_macros();

-- 7. Seed inicial para Food Library (Basado en la lista del usuario)
INSERT INTO public.food_library (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, unit) VALUES
('Pechuga de Pollo', 165, 31, 0, 3.6, 'g'),
('Arroz Integral', 111, 2.6, 23, 0.9, 'g'),
('Avena en Copos', 389, 16.9, 66, 6.9, 'g'),
('Huevo Entero', 155, 13, 1.1, 11, 'ud'),
('Aguacate', 160, 2, 9, 15, 'g'),
('Salmón Noruego', 208, 20, 0, 13, 'g'),
('Yogur Griego Natural', 59, 10, 3.6, 0.4, 'g'),
('Plátano', 89, 1.1, 23, 0.3, 'ud'),
('Almendras', 579, 21, 22, 49, 'g'),
('Espinacas Frescas', 23, 2.9, 3.6, 0.4, 'g');

