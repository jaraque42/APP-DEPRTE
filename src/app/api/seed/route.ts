import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FoodLibrary from '@/lib/models/FoodLibrary';

const SEED_FOODS = [
  // 🥩 PROTEÍNAS
  { name: 'Pechuga de Pollo', category: 'Proteínas', kcal_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, unit: 'g' },
  { name: 'Muslo de Pollo', category: 'Proteínas', kcal_per_100g: 209, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 11, unit: 'g' },
  { name: 'Ternera Magra', category: 'Proteínas', kcal_per_100g: 137, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 3.5, unit: 'g' },
  { name: 'Carne Picada (5% grasa)', category: 'Proteínas', kcal_per_100g: 137, protein_per_100g: 21, carbs_per_100g: 0, fat_per_100g: 5, unit: 'g' },
  { name: 'Lomo de Cerdo', category: 'Proteínas', kcal_per_100g: 143, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 3.5, unit: 'g' },
  { name: 'Pavo (pechuga)', category: 'Proteínas', kcal_per_100g: 104, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 1, unit: 'g' },
  { name: 'Salmón', category: 'Proteínas', kcal_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13, unit: 'g' },
  { name: 'Atún Fresco', category: 'Proteínas', kcal_per_100g: 144, protein_per_100g: 23, carbs_per_100g: 0, fat_per_100g: 5, unit: 'g' },
  { name: 'Atún en Lata (natural)', category: 'Proteínas', kcal_per_100g: 132, protein_per_100g: 29, carbs_per_100g: 0, fat_per_100g: 1, unit: 'g' },
  { name: 'Merluza', category: 'Proteínas', kcal_per_100g: 82, protein_per_100g: 17, carbs_per_100g: 0, fat_per_100g: 1.3, unit: 'g' },
  { name: 'Gambas', category: 'Proteínas', kcal_per_100g: 85, protein_per_100g: 18, carbs_per_100g: 0, fat_per_100g: 1.2, unit: 'g' },
  { name: 'Langostinos', category: 'Proteínas', kcal_per_100g: 77, protein_per_100g: 17, carbs_per_100g: 0, fat_per_100g: 0.9, unit: 'g' },
  { name: 'Huevo Entero', category: 'Proteínas', kcal_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, unit: 'ud' },
  { name: 'Claras de Huevo', category: 'Proteínas', kcal_per_100g: 52, protein_per_100g: 11, carbs_per_100g: 0.7, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Proteína Whey', category: 'Proteínas', kcal_per_100g: 400, protein_per_100g: 80, carbs_per_100g: 10, fat_per_100g: 5, unit: 'g' },
  { name: 'Tofu', category: 'Proteínas', kcal_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 1.9, fat_per_100g: 4.8, unit: 'g' },
  { name: 'Jamón Serrano', category: 'Proteínas', kcal_per_100g: 241, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 13, unit: 'g' },
  { name: 'Jamón York / Pavo', category: 'Proteínas', kcal_per_100g: 105, protein_per_100g: 18, carbs_per_100g: 1.5, fat_per_100g: 3, unit: 'g' },

  // 🍚 CARBOHIDRATOS
  { name: 'Arroz Blanco (cocido)', category: 'Carbohidratos', kcal_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Arroz Integral (cocido)', category: 'Carbohidratos', kcal_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, unit: 'g' },
  { name: 'Pasta (cocida)', category: 'Carbohidratos', kcal_per_100g: 131, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 1.1, unit: 'g' },
  { name: 'Pasta Integral (cocida)', category: 'Carbohidratos', kcal_per_100g: 124, protein_per_100g: 5.3, carbs_per_100g: 25, fat_per_100g: 0.5, unit: 'g' },
  { name: 'Pan Blanco', category: 'Carbohidratos', kcal_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2, unit: 'g' },
  { name: 'Pan Integral', category: 'Carbohidratos', kcal_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4, unit: 'g' },
  { name: 'Patata (cocida)', category: 'Carbohidratos', kcal_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Boniato', category: 'Carbohidratos', kcal_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Avena', category: 'Carbohidratos', kcal_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9, unit: 'g' },
  { name: 'Quinoa (cocida)', category: 'Carbohidratos', kcal_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21, fat_per_100g: 1.9, unit: 'g' },
  { name: 'Cuscús (cocido)', category: 'Carbohidratos', kcal_per_100g: 112, protein_per_100g: 3.8, carbs_per_100g: 23, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Lentejas (cocidas)', category: 'Carbohidratos', kcal_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4, unit: 'g' },
  { name: 'Garbanzos (cocidos)', category: 'Carbohidratos', kcal_per_100g: 164, protein_per_100g: 9, carbs_per_100g: 27, fat_per_100g: 2.6, unit: 'g' },
  { name: 'Tortitas de Arroz', category: 'Carbohidratos', kcal_per_100g: 387, protein_per_100g: 8, carbs_per_100g: 82, fat_per_100g: 2.8, unit: 'ud' },
  { name: 'Cereales de Desayuno', category: 'Carbohidratos', kcal_per_100g: 378, protein_per_100g: 7, carbs_per_100g: 84, fat_per_100g: 1.5, unit: 'g' },

  // 🥦 VERDURAS Y HORTALIZAS
  { name: 'Brócoli', category: 'Verduras', kcal_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, unit: 'g' },
  { name: 'Espinacas', category: 'Verduras', kcal_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, unit: 'g' },
  { name: 'Lechuga', category: 'Verduras', kcal_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Tomate', category: 'Verduras', kcal_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Pepino', category: 'Verduras', kcal_per_100g: 12, protein_per_100g: 0.7, carbs_per_100g: 1.8, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Cebolla', category: 'Verduras', kcal_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Zanahoria', category: 'Verduras', kcal_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Pimiento', category: 'Verduras', kcal_per_100g: 31, protein_per_100g: 1, carbs_per_100g: 6, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Calabacín', category: 'Verduras', kcal_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Champiñones', category: 'Verduras', kcal_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Judías Verdes', category: 'Verduras', kcal_per_100g: 31, protein_per_100g: 1.8, carbs_per_100g: 7, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Berenjena', category: 'Verduras', kcal_per_100g: 25, protein_per_100g: 1, carbs_per_100g: 6, fat_per_100g: 0.2, unit: 'g' },

  // 🍎 FRUTAS
  { name: 'Plátano', category: 'Frutas', kcal_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3, unit: 'ud' },
  { name: 'Manzana', category: 'Frutas', kcal_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, unit: 'ud' },
  { name: 'Naranja', category: 'Frutas', kcal_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1, unit: 'ud' },
  { name: 'Fresas', category: 'Frutas', kcal_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 7.7, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Arándanos', category: 'Frutas', kcal_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14.5, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Uvas', category: 'Frutas', kcal_per_100g: 69, protein_per_100g: 0.7, carbs_per_100g: 18, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Sandía', category: 'Frutas', kcal_per_100g: 30, protein_per_100g: 0.6, carbs_per_100g: 7.6, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Piña', category: 'Frutas', kcal_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Kiwi', category: 'Frutas', kcal_per_100g: 61, protein_per_100g: 1.1, carbs_per_100g: 15, fat_per_100g: 0.5, unit: 'ud' },
  { name: 'Aguacate', category: 'Frutas', kcal_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, unit: 'g' },
  { name: 'Melocotón', category: 'Frutas', kcal_per_100g: 39, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.3, unit: 'ud' },
  { name: 'Pera', category: 'Frutas', kcal_per_100g: 57, protein_per_100g: 0.4, carbs_per_100g: 15, fat_per_100g: 0.1, unit: 'ud' },

  // 🥛 LÁCTEOS
  { name: 'Leche Entera', category: 'Lácteos', kcal_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3, unit: 'ml' },
  { name: 'Leche Desnatada', category: 'Lácteos', kcal_per_100g: 34, protein_per_100g: 3.4, carbs_per_100g: 5, fat_per_100g: 0.1, unit: 'ml' },
  { name: 'Leche Semidesnatada', category: 'Lácteos', kcal_per_100g: 46, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 1.6, unit: 'ml' },
  { name: 'Yogur Natural', category: 'Lácteos', kcal_per_100g: 59, protein_per_100g: 3.5, carbs_per_100g: 4.7, fat_per_100g: 3.3, unit: 'g' },
  { name: 'Yogur Griego', category: 'Lácteos', kcal_per_100g: 97, protein_per_100g: 9, carbs_per_100g: 3.6, fat_per_100g: 5, unit: 'g' },
  { name: 'Yogur Skyr', category: 'Lácteos', kcal_per_100g: 63, protein_per_100g: 11, carbs_per_100g: 4, fat_per_100g: 0.2, unit: 'g' },
  { name: 'Queso Fresco', category: 'Lácteos', kcal_per_100g: 174, protein_per_100g: 11, carbs_per_100g: 3, fat_per_100g: 13, unit: 'g' },
  { name: 'Queso Curado', category: 'Lácteos', kcal_per_100g: 402, protein_per_100g: 25, carbs_per_100g: 0.5, fat_per_100g: 33, unit: 'g' },
  { name: 'Queso Mozzarella', category: 'Lácteos', kcal_per_100g: 280, protein_per_100g: 28, carbs_per_100g: 3.1, fat_per_100g: 17, unit: 'g' },
  { name: 'Requesón', category: 'Lácteos', kcal_per_100g: 98, protein_per_100g: 11, carbs_per_100g: 3.4, fat_per_100g: 4, unit: 'g' },

  // 🥜 GRASAS Y FRUTOS SECOS
  { name: 'Aceite de Oliva', category: 'Grasas', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, unit: 'ml' },
  { name: 'Almendras', category: 'Grasas', kcal_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 49, unit: 'g' },
  { name: 'Nueces', category: 'Grasas', kcal_per_100g: 654, protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65, unit: 'g' },
  { name: 'Cacahuetes', category: 'Grasas', kcal_per_100g: 567, protein_per_100g: 26, carbs_per_100g: 16, fat_per_100g: 49, unit: 'g' },
  { name: 'Crema de Cacahuete', category: 'Grasas', kcal_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50, unit: 'g' },
  { name: 'Mantequilla', category: 'Grasas', kcal_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81, unit: 'g' },
  { name: 'Semillas de Chía', category: 'Grasas', kcal_per_100g: 486, protein_per_100g: 17, carbs_per_100g: 42, fat_per_100g: 31, unit: 'g' },
  { name: 'Semillas de Lino', category: 'Grasas', kcal_per_100g: 534, protein_per_100g: 18, carbs_per_100g: 29, fat_per_100g: 42, unit: 'g' },

  // 🥤 BEBIDAS
  { name: 'Bebida de Avena', category: 'Bebidas', kcal_per_100g: 43, protein_per_100g: 0.3, carbs_per_100g: 8, fat_per_100g: 1, unit: 'ml' },
  { name: 'Bebida de Soja', category: 'Bebidas', kcal_per_100g: 33, protein_per_100g: 3.3, carbs_per_100g: 0.4, fat_per_100g: 1.8, unit: 'ml' },
  { name: 'Bebida de Almendras', category: 'Bebidas', kcal_per_100g: 17, protein_per_100g: 0.6, carbs_per_100g: 0.3, fat_per_100g: 1.2, unit: 'ml' },
  { name: 'Zumo de Naranja', category: 'Bebidas', kcal_per_100g: 45, protein_per_100g: 0.7, carbs_per_100g: 10, fat_per_100g: 0.2, unit: 'ml' },
  { name: 'Café Solo', category: 'Bebidas', kcal_per_100g: 2, protein_per_100g: 0.1, carbs_per_100g: 0, fat_per_100g: 0, unit: 'ml' },

  // 🍫 SNACKS Y OTROS
  { name: 'Chocolate Negro 85%', category: 'Snacks', kcal_per_100g: 580, protein_per_100g: 10, carbs_per_100g: 20, fat_per_100g: 46, unit: 'g' },
  { name: 'Miel', category: 'Snacks', kcal_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82, fat_per_100g: 0, unit: 'g' },
  { name: 'Mermelada', category: 'Snacks', kcal_per_100g: 250, protein_per_100g: 0.4, carbs_per_100g: 60, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Barrita Energética', category: 'Snacks', kcal_per_100g: 420, protein_per_100g: 10, carbs_per_100g: 55, fat_per_100g: 18, unit: 'ud' },
  { name: 'Barrita Proteica', category: 'Snacks', kcal_per_100g: 350, protein_per_100g: 30, carbs_per_100g: 30, fat_per_100g: 12, unit: 'ud' },
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Drop existing foods and reseed with the full list
    await FoodLibrary.deleteMany({});
    await FoodLibrary.insertMany(SEED_FOODS);
    
    return NextResponse.json({ 
      message: `✅ Base de datos actualizada con ${SEED_FOODS.length} alimentos`,
      count: SEED_FOODS.length,
      categories: [...new Set(SEED_FOODS.map(f => f.category))],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
