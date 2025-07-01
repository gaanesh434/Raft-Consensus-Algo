import mongoose, { Schema, Document } from 'mongoose';

export interface IRaftNode extends Document {
  nodeId: string;
  state: 'follower' | 'candidate' | 'leader';
  term: number;
  votedFor: string | null;
  log: ILogEntry[];
  isAlive: boolean;
  lastHeartbeat: Date;
  votes: number;
  commitIndex: number;
  lastApplied: number;
  clusterId: string;
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ILogEntry {
  term: number;
  index: number;
  command: string;
  timestamp: Date;
  committed: boolean;
}

const LogEntrySchema = new Schema<ILogEntry>({
  term: { type: Number, required: true },
  index: { type: Number, required: true },
  command: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  committed: { type: Boolean, default: false }
});

const RaftNodeSchema = new Schema<IRaftNode>({
  nodeId: { type: String, required: true, unique: true },
  state: { 
    type: String, 
    enum: ['follower', 'candidate', 'leader'], 
    default: 'follower' 
  },
  term: { type: Number, default: 0 },
  votedFor: { type: String, default: null },
  log: [LogEntrySchema],
  isAlive: { type: Boolean, default: true },
  lastHeartbeat: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  commitIndex: { type: Number, default: -1 },
  lastApplied: { type: Number, default: -1 },
  clusterId: { type: String, required: true },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
RaftNodeSchema.index({ clusterId: 1, nodeId: 1 });
RaftNodeSchema.index({ clusterId: 1, state: 1 });
RaftNodeSchema.index({ clusterId: 1, term: 1 });

export const RaftNode = mongoose.model<IRaftNode>('RaftNode', RaftNodeSchema);