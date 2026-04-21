import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendship extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}

const FriendshipSchema: Schema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
}, { timestamps: true });

// Evitar duplicados y asegurar orden para consultas fáciles
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.models.Friendship || mongoose.model<IFriendship>('Friendship', FriendshipSchema);
