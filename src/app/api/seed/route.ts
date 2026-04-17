import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FoodLibrary from '@/lib/models/FoodLibrary';

const SEED_FOODS = [
  { name: 'Pechuga de Pollo', kcal_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, unit: 'g' },
  { name: 'Arroz Integral', kcal_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, unit: 'g' },
  { name: 'Huevo Entero', kcal_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, unit: 'ud' },
  { name: 'Avena', kcal_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9, unit: 'g' },
  { name: 'Plátano', kcal_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3, unit: 'ud' },
  { name: 'Aceite de Oliva', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, unit: 'g' },
  { name: 'Atún en lata', kcal_per_100g: 132, protein_per_100g: 29, carbs_per_100g: 0, fat_per_100g: 1, unit: 'g' },
  { name: 'Pan Integral', kcal_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4, unit: 'g' },
  { name: 'Leche Entera', kcal_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3, unit: 'ml' },
  { name: 'Yogur Natural', kcal_per_100g: 59, protein_per_100g: 3.5, carbs_per_100g: 4.7, fat_per_100g: 3.3, unit: 'g' },
  { name: 'Pasta', kcal_per_100g: 131, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 1.1, unit: 'g' },
  { name: 'Patata', kcal_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1, unit: 'g' },
  { name: 'Salmón', kcal_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13, unit: 'g' },
  { name: 'Almendras', kcal_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 49, unit: 'g' },
  { name: 'Brócoli', kcal_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, unit: 'g' },
  { name: 'Arroz Blanco', kcal_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, unit: 'g' },
  { name: 'Queso Fresco', kcal_per_100g: 174, protein_per_100g: 11, carbs_per_100g: 3, fat_per_100g: 13, unit: 'g' },
  { name: 'Aguacate', kcal_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, unit: 'g' },
  { name: 'Manzana', kcal_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, unit: 'ud' },
  { name: 'Proteína Whey', kcal_per_100g: 400, protein_per_100g: 80, carbs_per_100g: 10, fat_per_100g: 5, unit: 'g' },
];

export async function GET() {
  try {
    await connectToDatabase();
    
    const existingCount = await FoodLibrary.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ message: `Base de datos ya tiene ${existingCount} alimentos. No se necesita sembrar.`, count: existingCount });
    }

    await FoodLibrary.insertMany(SEED_FOODS);
    
    return NextResponse.json({ message: `✅ Sembrados ${SEED_FOODS.length} alimentos en MongoDB Atlas`, count: SEED_FOODS.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
