import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChaosConfig {
  enabled: boolean;
  nodeFailureRate: number;
  networkPartitionRate: number;
  messageDropRate: number;
  networkDelayRange: [number, number];
  recoveryRate: number;
}

interface ChaosState {
  config: ChaosConfig;
  isRunning: boolean;
  events: ChaosEvent[];
}

interface ChaosEvent {
  id: string;
  type: 'node_failure' | 'network_partition' | 'message_drop' | 'network_delay' | 'recovery';
  nodeId?: string;
  timestamp: string;
  description: string;
}

const initialState: ChaosState = {
  config: {
    enabled: false,
    nodeFailureRate: 0.1,
    networkPartitionRate: 0.05,
    messageDropRate: 0.02,
    networkDelayRange: [100, 1000],
    recoveryRate: 0.3,
  },
  isRunning: false,
  events: [],
};

const chaosSlice = createSlice({
  name: 'chaos',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<ChaosConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    setRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
      state.config.enabled = action.payload;
    },
    addEvent: (state, action: PayloadAction<Omit<ChaosEvent, 'id' | 'timestamp'>>) => {
      const event: ChaosEvent = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.events.unshift(event);
      
      // Keep only the last 100 events
      if (state.events.length > 100) {
        state.events = state.events.slice(0, 100);
      }
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
});

export const {
  updateConfig,
  setRunning,
  addEvent,
  clearEvents,
} = chaosSlice.actions;

export default chaosSlice.reducer;