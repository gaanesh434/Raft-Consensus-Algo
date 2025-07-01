import { configureStore } from '@reduxjs/toolkit';
import raftReducer from './slices/raftSlice';
import uiReducer from './slices/uiSlice';
import chaosReducer from './slices/chaosSlice';

export const store = configureStore({
  reducer: {
    raft: raftReducer,
    ui: uiReducer,
    chaos: chaosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['raft/setSocket'],
        ignoredPaths: ['raft.socket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;