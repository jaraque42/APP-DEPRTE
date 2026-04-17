import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkoutPlan extends Document {
  user_id: string;
  routine_id: string;
  category: string;
  level: string;
  days: string[];
  duration_weeks: number;
}

const WorkoutPlanSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  routine_id: { type: String, required: true },
  category: { type: String },
  level: { type: String },
  days: [{ type: String }],
  duration_weeks: { type: Number, default: 4 }
}, { timestamps: true });

export default mongoose.models.WorkoutPlan || mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
