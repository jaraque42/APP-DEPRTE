import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodLibrary extends Document {
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  unit: string;
}

const FoodLibrarySchema: Schema = new Schema({
  name: { type: String, required: true },
  kcal_per_100g: { type: Number, required: true },
  protein_per_100g: { type: Number, required: true },
  carbs_per_100g: { type: Number, required: true },
  fat_per_100g: { type: Number, required: true },
  unit: { type: String, default: 'g' }
}, { timestamps: true });

export default mongoose.models.FoodLibrary || mongoose.model<IFoodLibrary>('FoodLibrary', FoodLibrarySchema);
