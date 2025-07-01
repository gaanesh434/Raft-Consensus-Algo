import React, { useEffect, useState, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { VisualizationPage } from './pages/VisualizationPage';
import { LogsPage } from './pages/LogsPage';
import { PerformancePage } from './pages/PerformancePage';
import { ChaosPage } from './pages/ChaosPage';
import { SettingsPage } from './pages/SettingsPage';

interface Node {
  nodeId: string;
  state: 'follower' | 'candidate' | 'leader';
  term: number;
  isAlive: boolean;
  position: { x: number; y: number };
  votes: number;
  log: LogEntry[];
  commitIndex: number;
  lastApplied: number;
  votedFor: string | null;
  lastHeartbeat: string;
  isPartitioned?: boolean;
}

interface LogEntry {
  term: number;
  index: number;
  command: string;
  timestamp: string;
  committed: boolean;
}

interface Message {
  type: string;
  from: string;
  to: string;
  term: number;
  timestamp: string;
  success?: boolean;
  data?: any;
}

interface AppState {
  nodes: Node[];
  messages: Message[];
  connected: boolean;
  socket: any;
  selectedNode: string | null;
  error: string | null;
  isLoading: boolean;
  performanceStats: any;
  chaosMode: boolean;
  currentPage: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    nodes: [],
    messages: [],
    connected: false,
    socket: null,
    selectedNode: null,
    error: null,
    isLoading: true,
    performanceStats: null,
    chaosMode: false,
    currentPage: 'dashboard'
  });

  // Safe state updater
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Error handler
  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`App Error ${context ? `(${context})` : ''}:`, error);
    updateState({ 
      error: error.message,
      isLoading: false 
    });
  }, [updateState]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        updateState({ isLoading: true, error: null });

        const io = await import('socket.io-client').catch((importError) => {
          throw new Error(`Failed to load socket.io-client: ${importError.message}`);
        });

        if (!io.default) {
          throw new Error('socket.io-client module is invalid');
        }

        const newSocket = io.default('http://localhost:3002', {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('Connected to server');
          updateState({ 
            connected: true, 
            socket: newSocket, 
            isLoading: false,
            error: null 
          });
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          updateState({ connected: false });
        });

        newSocket.on('nodes-updated', (updatedNodes: Node[]) => {
          try {
            if (!Array.isArray(updatedNodes)) {
              throw new Error('Invalid nodes data received');
            }
            console.log('Nodes updated:', updatedNodes);
            updateState({ nodes: updatedNodes });
          } catch (error) {
            handleError(error as Error, 'nodes-updated');
          }
        });

        newSocket.on('messages-updated', (updatedMessages: Message[]) => {
          try {
            if (!Array.isArray(updatedMessages)) {
              throw new Error('Invalid messages data received');
            }
            console.log('Messages updated:', updatedMessages);
            updateState({ messages: updatedMessages.slice(-50) });
          } catch (error) {
            handleError(error as Error, 'messages-updated');
          }
        });

        newSocket.on('performance-stats', (stats: any) => {
          updateState({ performanceStats: stats });
        });

        newSocket.on('chaos-status', (status: { enabled: boolean }) => {
          updateState({ chaosMode: status.enabled });
        });

        newSocket.on('connect_error', (error: any) => {
          console.error('Connection error:', error);
          handleError(new Error(`Connection failed: ${error.message || error}`), 'connect_error');
        });

        newSocket.on('error', (error: any) => {
          console.error('Socket error:', error);
          handleError(new Error(`Socket error: ${error.message || error}`), 'socket_error');
        });

      } catch (error) {
        handleError(error as Error, 'WebSocket initialization');
      }
    };

    connectWebSocket();

    return () => {
      if (state.socket) {
        state.socket.disconnect();
      }
    };
  }, []);

  // Safe socket emission wrapper
  const emitSafely = useCallback((event: string, data?: any) => {
    try {
      if (!state.socket || !state.connected) {
        throw new Error('Socket not connected');
      }
      state.socket.emit(event, data);
    } catch (error) {
      handleError(error as Error, `emit ${event}`);
    }
  }, [state.socket, state.connected, handleError]);

  // Event handlers
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    updateState({ selectedNode: nodeId });
  }, [updateState]);

  const handleAddSampleNodes = useCallback(() => {
    try {
      if (!state.socket) {
        throw new Error('Not connected to server');
      }
      
      ['node-1', 'node-2', 'node-3'].forEach((id, index) => {
        setTimeout(() => emitSafely('register-node', id), index * 200);
      });
    } catch (error) {
      handleError(error as Error, 'add sample nodes');
    }
  }, [state.socket, emitSafely, handleError]);

  const handleStartElection = useCallback(() => {
    try {
      if (!state.socket || state.nodes.length === 0) {
        throw new Error('No nodes available for election');
      }
      
      const aliveNodes = state.nodes.filter(n => n.isAlive && n.state === 'follower');
      if (aliveNodes.length === 0) {
        throw new Error('No eligible nodes for election');
      }
      
      const randomNode = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
      emitSafely('start-election', { candidateId: randomNode.nodeId });
    } catch (error) {
      handleError(error as Error, 'start election');
    }
  }, [state.socket, state.nodes, emitSafely, handleError]);

  const handleAddLogEntry = useCallback((command: string) => {
    try {
      if (!command.trim()) {
        throw new Error('Log command cannot be empty');
      }
      if (!state.socket) {
        throw new Error('Not connected to server');
      }
      
      emitSafely('add-log-entry', { command: command.trim() });
    } catch (error) {
      handleError(error as Error, 'add log entry');
    }
  }, [state.socket, emitSafely, handleError]);

  const handleNodeAction = useCallback((nodeId: string, action: string) => {
    try {
      if (!state.socket) {
        throw new Error('Not connected to server');
      }
      
      switch (action) {
        case 'fail':
          emitSafely('node-failure', { nodeId });
          break;
        case 'restart':
          emitSafely('node-restart', { nodeId });
          break;
        case 'partition':
          emitSafely('network-partition', { nodeId });
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      handleError(error as Error, `node action ${action}`);
    }
  }, [state.socket, emitSafely, handleError]);

  const handleToggleChaos = useCallback(() => {
    try {
      if (!state.socket) {
        throw new Error('Not connected to server');
      }
      
      if (state.chaosMode) {
        emitSafely('stop-chaos');
      } else {
        emitSafely('start-chaos');
      }
    } catch (error) {
      handleError(error as Error, 'toggle chaos');
    }
  }, [state.socket, state.chaosMode, emitSafely, handleError]);

  const handlePageChange = useCallback((page: string) => {
    updateState({ currentPage: page });
  }, [updateState]);

  // Handlers object for passing to components
  const handlers = {
    handleNodeSelect,
    handleAddSampleNodes,
    handleStartElection,
    handleAddLogEntry,
    handleNodeAction,
    handleToggleChaos
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-2xl font-bold mb-2">Loading Raft Simulator</div>
          <div className="text-lg opacity-80">Connecting to server...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md w-full text-center text-white">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold mb-4">Application Error</h2>
          <p className="mb-6 opacity-90">{state.error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => updateState({ error: null, isLoading: true })}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-red-900 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render current page
  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'dashboard':
        return <Dashboard state={state} handlers={handlers} />;
      case 'visualization':
        return <VisualizationPage state={state} handlers={handlers} />;
      case 'logs':
        return <LogsPage state={state} />;
      case 'performance':
        return <PerformancePage state={state} />;
      case 'chaos':
        return <ChaosPage state={state} handlers={handlers} />;
      case 'settings':
        return <SettingsPage state={state} />;
      default:
        return <Dashboard state={state} handlers={handlers} />;
    }
  };

  // Main application UI
  return (
    <ErrorBoundary onError={handleError}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">🔗</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Raft Consensus Simulator</h1>
                  <p className="text-sm text-gray-300">Distributed Systems Visualization</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${state.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-white font-medium">
                    {state.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                {/* Chaos Mode Toggle */}
                <button
                  onClick={handleToggleChaos}
                  disabled={!state.connected}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    state.chaosMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {state.chaosMode ? '🔥 Chaos ON' : '🛡️ Chaos OFF'}
                </button>
                
                {/* Node Count */}
                <div className="text-white">
                  <span className="text-sm opacity-80">Nodes: </span>
                  <span className="font-bold">{state.nodes.length}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation currentPage={state.currentPage} onPageChange={handlePageChange} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {renderCurrentPage()}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;