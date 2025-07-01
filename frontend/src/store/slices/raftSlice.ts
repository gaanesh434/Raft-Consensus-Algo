import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

export interface RaftNode {
  nodeId: string;
  state: 'follower' | 'candidate' | 'leader';
  term: number;
  votedFor: string | null;
  log: LogEntry[];
  isAlive: boolean;
  lastHeartbeat: string;
  votes: number;
  commitIndex: number;
  lastApplied: number;
  clusterId: string;
  position: { x: number; y: number };
  isPartitioned?: boolean;
}

export interface LogEntry {
  term: number;
  index: number;
  command: string;
  timestamp: string;
  committed: boolean;
}

export interface NetworkMessage {
  type: 'heartbeat' | 'vote_request' | 'vote_response' | 'append_entries' | 'append_entries_response';
  from: string;
  to: string;
  term: number;
  data?: any;
  timestamp: string;
  success?: boolean;
}

interface RaftState {
  nodes: RaftNode[];
  messages: NetworkMessage[];
  selectedNode: string | null;
  currentTerm: number;
  leader: string | null;
  clusterId: string;
  socket: Socket | null;
  connected: boolean;
}

const initialState: RaftState = {
  nodes: [],
  messages: [],
  selectedNode: null,
  currentTerm: 0,
  leader: null,
  clusterId: 'default',
  socket: null,
  connected: false,
};

const raftSlice = createSlice({
  name: 'raft',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<RaftNode[]>) => {
      state.nodes = action.payload;
      state.currentTerm = Math.max(...action.payload.map(n => n.term), 0);
      state.leader = action.payload.find(n => n.state === 'leader' && n.isAlive)?.nodeId || null;
    },
    addNode: (state, action: PayloadAction<RaftNode>) => {
      const existingIndex = state.nodes.findIndex(n => n.nodeId === action.payload.nodeId);
      if (existingIndex >= 0) {
        state.nodes[existingIndex] = action.payload;
      } else {
        state.nodes.push(action.payload);
      }
    },
    updateNodePosition: (state, action: PayloadAction<{ nodeId: string; position: { x: number; y: number } }>) => {
      const node = state.nodes.find(n => n.nodeId === action.payload.nodeId);
      if (node) {
        node.position = action.payload.position;
      }
    },
    setMessages: (state, action: PayloadAction<NetworkMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<NetworkMessage>) => {
      state.messages.push(action.payload);
      if (state.messages.length > 100) {
        state.messages.shift();
      }
    },
    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNode = action.payload;
    },
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setClusterId: (state, action: PayloadAction<string>) => {
      state.clusterId = action.payload;
    },
  },
});

export const {
  setNodes,
  addNode,
  updateNodePosition,
  setMessages,
  addMessage,
  setSelectedNode,
  setSocket,
  setConnected,
  setClusterId,
} = raftSlice.actions;

export default raftSlice.reducer;