import mongoose, { Schema, Document } from 'mongoose';

export interface INetworkMessage extends Document {
  type: 'heartbeat' | 'vote_request' | 'vote_response' | 'append_entries' | 'append_entries_response';
  from: string;
  to: string;
  term: number;
  data: any;
  timestamp: Date;
  success?: boolean;
  clusterId: string;
  processed: boolean;
}

const NetworkMessageSchema = new Schema<INetworkMessage>({
  type: {
    type: String,
    enum: ['heartbeat', 'vote_request', 'vote_response', 'append_entries', 'append_entries_response'],
    required: true
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  term: { type: Number, required: true },
  data: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean },
  clusterId: { type: String, required: true },
  processed: { type: Boolean, default: false }
}, {
  timestamps: true
});

// TTL index to auto-delete old messages after 1 hour
NetworkMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
NetworkMessageSchema.index({ clusterId: 1, timestamp: -1 });

export const NetworkMessage = mongoose.model<INetworkMessage>('NetworkMessage', NetworkMessageSchema);