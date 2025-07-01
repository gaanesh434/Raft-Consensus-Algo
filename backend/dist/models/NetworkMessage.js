import mongoose, { Schema } from 'mongoose';
const NetworkMessageSchema = new Schema({
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
export const NetworkMessage = mongoose.model('NetworkMessage', NetworkMessageSchema);
