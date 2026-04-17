import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodLog extends Document {
  user_id: string;
  food_library?: any;
  food_name: string;
  amount: number;
  kcal_total: number;
  p_total: number;
  c_total: number;
  f_total: number;
  meal_type: string;
  log_date: string;
}

const FoodLogSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  food_library: { type: Schema.Types.ObjectId, ref: 'FoodLibrary' },
  food_name: { type: String },
  amount: { type: Number, required: true },
  kcal_total: { type: Number, required: true },
  p_total: { type: Number, required: true },
  c_total: { type: Number, required: true },
  f_total: { type: Number, required: true },
  meal_type: { type: String },
  log_date: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.FoodLog || mongoose.model<IFoodLog>('FoodLog', FoodLogSchema);
