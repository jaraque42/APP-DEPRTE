import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: string;
  activity_level?: number;
  goal_type?: string;
  target_kcal?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  onboarding_complete?: boolean;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  weight_kg: { type: Number },
  height_cm: { type: Number },
  age: { type: Number },
  gender: { type: String },
  activity_level: { type: Number },
  goal_type: { type: String },
  target_kcal: { type: Number },
  target_protein: { type: Number },
  target_carbs: { type: Number },
  target_fats: { type: Number },
  onboarding_complete: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
