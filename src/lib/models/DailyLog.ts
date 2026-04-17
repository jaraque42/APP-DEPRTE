import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLog extends Document {
  user_id: string;
  log_date: string;
  calories_consumed?: number;
  workout_done?: boolean;
  status?: string;
}

const DailyLogSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  log_date: { type: String, required: true },
  calories_consumed: { type: Number, default: 0 },
  workout_done: { type: Boolean, default: false },
  status: { type: String }
}, { timestamps: true });

DailyLogSchema.index({ user_id: 1, log_date: 1 }, { unique: true });

export default mongoose.models.DailyLog || mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
