import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  created_at: Date;
}

const ChatMessageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
