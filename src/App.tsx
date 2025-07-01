import React, { useEffect, useState, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import HowToUse from './components/HowToUse';
import Dashboard from './pages/Dashboard';
import VisualizationPage from './pages/VisualizationPage';
import LogsPage from './pages/LogsPage';
import PerformancePage from './pages/PerformancePage';
import ChaosPage from './pages/ChaosPage';
import SettingsPage from './pages/SettingsPage';
import { AppState, Handlers, Node, Message, LogEntry } from './types';
import { io } from 'socket.io-client';

function App() {
  const [state, setState] = useState<AppState>({
    nodes: [
      {
        nodeId: 'node-1',
        state: 'leader',
        term: 2,
        isAlive: true,
        position: { x: 200, y: 200 },
        votes: 2,
        log: [
          { term: 1, index: 0, command: 'SET x=1', timestamp: new Date(Date.now() - 5000).toISOString(), committed: true },
          { term: 2, index: 1, command: 'SET y=2', timestamp: new Date(Date.now() - 3000).toISOString(), committed: true },
          { term: 2, index: 2, command: 'SET z=3', timestamp: new Date().toISOString(), committed: false }
        ],
        commitIndex: 1,
        lastApplied: 1,
        votedFor: null,
        lastHeartbeat: new Date().toISOString()
      },
      {
        nodeId: 'node-2',
        state: 'follower',
        term: 2,
        isAlive: true,
        position: { x: 450, y: 200 },
        votes: 0,
        log: [
          { term: 1, index: 0, command: 'SET x=1', timestamp: new Date(Date.now() - 5000).toISOString(), committed: true },
          { term: 2, index: 1, command: 'SET y=2', timestamp: new Date(Date.now() - 3000).toISOString(), committed: true }
        ],
        commitIndex: 1,
        lastApplied: 1,
        votedFor: 'node-1',
        lastHeartbeat: new Date().toISOString()
      },
      {
        nodeId: 'node-3',
        state: 'follower',
        term: 2,
        isAlive: true,
        position: { x: 325, y: 350 },
        votes: 0,
        log: [
          { term: 1, index: 0, command: 'SET x=1', timestamp: new Date(Date.now() - 5000).toISOString(), committed: true },
          { term: 2, index: 1, command: 'SET y=2', timestamp: new Date(Date.now() - 3000).toISOString(), committed: true }
        ],
        commitIndex: 1,
        lastApplied: 1,
        votedFor: 'node-1',
        lastHeartbeat: new Date().toISOString()
      }
    ],
    messages: [],
    connected: false,
    socket: null,
    selectedNode: null,
    error: null,
    isLoading: false,
    performanceStats: {
      nodeCount: 3,
      messageCount: 0,
      memoryUsage: { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 },
      uptime: 0
    },
    chaosMode: false,
    currentPage: 'dashboard',
    showHelp: false,
    theme: 'dark',
    language: 'en',
    notifications: false,
    autoSave: true
  });



  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://localhost:3002', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to backend');
      setState(prev => ({
        ...prev,
        connected: true,
        socket: socket,
        isLoading: false,
        error: null
      }));
      
      // Join cluster
      socket.emit('join-cluster', 'raft-cluster');
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from backend:', reason);
      setState(prev => ({
        ...prev,
        connected: false,
        socket: null,
        error: 'Disconnected from backend'
      }));
    });

    // Handle node updates
    socket.on('node-update', (updatedNodes) => {
      setState(prev => ({
        ...prev,
        nodes: updatedNodes
      }));
    });

    // Handle message updates
    socket.on('message-update', (updatedMessages) => {
      setState(prev => ({
        ...prev,
        messages: updatedMessages
      }));
    });

    // Handle performance updates
    socket.on('performance-update', (stats) => {
      setState(prev => ({
        ...prev,
        performanceStats: stats
      }));
    });

    // Clean up
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Initialize with sample nodes
    const sampleNodes: Node[] = [
      {
        nodeId: 'node1',
        state: 'follower' as const,
        term: 1,
        isAlive: true,
        position: { x: 200, y: 200 },
        votes: 0,
        log: [],
        commitIndex: 0,
        lastApplied: 0,
        votedFor: null,
        lastHeartbeat: new Date().toISOString()
      },
      {
        nodeId: 'node2',
        state: 'follower' as const,
        term: 1,
        isAlive: true,
        position: { x: 400, y: 200 },
        votes: 0,
        log: [],
        commitIndex: 0,
        lastApplied: 0,
        votedFor: null,
        lastHeartbeat: new Date().toISOString()
      },
      {
        nodeId: 'node3',
        state: 'follower' as const,
        term: 1,
        isAlive: true,
        position: { x: 300, y: 400 },
        votes: 0,
        log: [],
        commitIndex: 0,
        lastApplied: 0,
        votedFor: null,
        lastHeartbeat: new Date().toISOString()
      }
    ];

    setState(prev => ({
      ...prev,
      nodes: sampleNodes
    }));
  }, []);

  // Safe state updater
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Enhanced Raft logic with proper consensus rules
  const validateElection = (candidateId: string, nodes: Node[]) => {
    const candidate = nodes.find(n => n.nodeId === candidateId);
    if (!candidate || !candidate.isAlive) return false;
    
    const aliveNodes = nodes.filter(n => n.isAlive && !n.isPartitioned);
    const majorityThreshold = Math.floor(aliveNodes.length / 2) + 1;
    
    return candidate.votes >= majorityThreshold;
  };

  const replicateLogEntry = (leaderId: string, entry: LogEntry, nodes: Node[]) => {
    const leader = nodes.find(n => n.nodeId === leaderId);
    if (!leader || leader.state !== 'leader') return nodes;

    return nodes.map(node => {
      if (node.isAlive && !node.isPartitioned && node.nodeId !== leaderId) {
        // Simulate successful replication with some probability
        if (Math.random() > 0.1) { // 90% success rate
          return {
            ...node,
            log: [...node.log, entry]
          };
        }
      }
      return node;
    });
  };

  // Initialize demo data with enhanced logic
  useEffect(() => {
    const sampleNodes: Node[] = [
      {
        nodeId: 'node-1',
        state: 'leader',
        term: 2,
        isAlive: true,
        position: { x: 200, y: 200 },
        votes: 2,
        log: [
          { term: 1, index: 0, command: 'SET x=1', timestamp: new Date(Date.now() - 5000).toISOString(), committed: true },
          { term: 2, index: 1, command: 'SET y=2', timestamp: new Date(Date.now() - 3000).toISOString(), committed: true },
          { term: 2, index: 2, command: 'SET z=3', timestamp: new Date().toISOString(), committed: false }
        ],
        commitIndex: 1,
        lastApplied: 1,
        votedFor: null,
        lastHeartbeat: new Date().toISOString()
      },
      {
        nodeId: 'node-2',
        state: 'follower',
        term: 2,
        isAlive: true,
        position: { x: 450, y: 200 },
        votes: 0,
        log: [
          { term: 1, index: 0, command: 'SET x=1', timestamp: new Date(Date.now() - 5000).toISOString(), committed: true },
          { term: 2, index: 1, command: 'SET y=2', timestamp: new Date(Date.now() - 3000).toISOString(), committed: true }
        ],
        commitIndex: 1,
        lastApplied: 1,
        votedFor: 'node-1',
        lastHeartbeat: new Date().toISOString()
      },
      {
        nodeId: 'node-3',
        state: 'follower',
        term: 2,
        isAlive: true,
        position: { x: 325, y: 350 },
        votes: 0,
        log: [
          { term: 1, index: 0, command: 'SET x=1', timestamp: new Date(Date.now() - 5000).toISOString(), committed: true },
          { term: 2, index: 1, command: 'SET y=2', timestamp: new Date(Date.now() - 3000).toISOString(), committed: true }
        ],
        commitIndex: 1,
        lastApplied: 1,
        votedFor: 'node-1',
        lastHeartbeat: new Date().toISOString()
      }
    ];

    const sampleMessages: Message[] = [
      {
        type: 'heartbeat',
        from: 'node-1',
        to: 'node-2',
        term: 2,
        timestamp: new Date(Date.now() - 1000).toISOString(),
        success: true
      },
      {
        type: 'heartbeat',
        from: 'node-1',
        to: 'node-3',
        term: 2,
        timestamp: new Date(Date.now() - 800).toISOString(),
        success: true
      },
      {
        type: 'append_entries',
        from: 'node-1',
        to: 'node-2',
        term: 2,
        timestamp: new Date(Date.now() - 3000).toISOString(),
        success: true,
        data: { entries: [{ term: 2, index: 1, command: 'SET y=2' }] }
      }
    ];

    updateState({ 
      nodes: sampleNodes, 
      messages: sampleMessages
    });

    // Enhanced heartbeat simulation
    const heartbeatInterval = setInterval(() => {
      setState(prevState => {
        const leader = prevState.nodes.find(n => n.state === 'leader' && n.isAlive);
        if (!leader) return prevState;

        const followers = prevState.nodes.filter(n => 
          n.state === 'follower' && n.isAlive && !n.isPartitioned
        );

        const newMessages = followers.map(follower => ({
          type: 'heartbeat',
          from: leader.nodeId,
          to: follower.nodeId,
          term: leader.term,
          timestamp: new Date().toISOString(),
          success: true
        }));

        return {
          ...prevState,
          messages: [...prevState.messages.slice(-20), ...newMessages]
        };
      });
    }, 3000);

    return () => clearInterval(heartbeatInterval);
  }, [updateState]);

  // Event handlers with enhanced logic
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    updateState({ selectedNode: nodeId });
  }, [updateState]);

  const handleAddSampleNodes = useCallback(() => {
    const newNode: Node = {
      nodeId: `node-${state.nodes.length + 1}`,
      state: 'follower',
      term: Math.max(...state.nodes.map(n => n.term), 0),
      isAlive: true,
      position: { 
        x: Math.random() * 600 + 100, 
        y: Math.random() * 400 + 100 
      },
      votes: 0,
      log: [],
      commitIndex: -1,
      lastApplied: -1,
      votedFor: null,
      lastHeartbeat: new Date().toISOString()
    };

    updateState({ 
      nodes: [...state.nodes, newNode],
      performanceStats: {
        ...state.performanceStats,
        nodeCount: state.nodes.length + 1
      }
    });
  }, [state.nodes, state.performanceStats, updateState]);

  const handleStartElection = useCallback(() => {
    const followerNodes = state.nodes.filter(n => n.state === 'follower' && n.isAlive && !n.isPartitioned);
    if (followerNodes.length === 0) return;

    const candidate = followerNodes[Math.floor(Math.random() * followerNodes.length)];
    const newTerm = Math.max(...state.nodes.map(n => n.term)) + 1;
    
    // Start election
    const updatedNodes = state.nodes.map(node => {
      if (node.nodeId === candidate.nodeId) {
        return { 
          ...node, 
          state: 'candidate' as const, 
          term: newTerm, 
          votes: 1,
          votedFor: candidate.nodeId
        };
      } else if (node.state === 'leader') {
        return { ...node, state: 'follower' as const };
      }
      return { ...node, term: newTerm, votedFor: null };
    });

    updateState({ nodes: updatedNodes });

    // Simulate voting process
    setTimeout(() => {
      setState(prevState => {
        const currentCandidate = prevState.nodes.find(n => n.nodeId === candidate.nodeId);
        if (!currentCandidate || currentCandidate.state !== 'candidate') return prevState;

        // Simulate votes from other nodes
        const aliveNodes = prevState.nodes.filter(n => n.isAlive && !n.isPartitioned);
        const votesReceived = aliveNodes.filter(() => Math.random() > 0.3).length;
        
        const finalNodes = prevState.nodes.map(node => {
          if (node.nodeId === candidate.nodeId) {
            const totalVotes = votesReceived;
            const isElected = validateElection(candidate.nodeId, aliveNodes);
            
            return {
              ...node,
              votes: totalVotes,
              state: isElected ? 'leader' as const : 'follower' as const
            };
          }
          return node;
        });

        return { ...prevState, nodes: finalNodes };
      });
    }, 2000);
  }, [state.nodes, updateState]);

  const handleAddLogEntry = useCallback((command: string) => {
    const leader = state.nodes.find(n => n.state === 'leader' && n.isAlive);
    if (!leader) return;

    const newEntry: LogEntry = {
      term: leader.term,
      index: leader.log.length,
      command,
      timestamp: new Date().toISOString(),
      committed: false
    };

    // Add to leader's log
    const updatedNodes = state.nodes.map(node => {
      if (node.nodeId === leader.nodeId) {
        return { ...node, log: [...node.log, newEntry] };
      }
      return node;
    });

    updateState({ nodes: updatedNodes });

    // Simulate log replication
    setTimeout(() => {
      setState(prevState => {
        const replicatedNodes = replicateLogEntry(leader.nodeId, newEntry, prevState.nodes);
        
        // Commit entry if replicated to majority
        const aliveNodes = replicatedNodes.filter(n => n.isAlive && !n.isPartitioned);
        const replicatedCount = replicatedNodes.filter(n => 
          n.log.some(entry => entry.index === newEntry.index && entry.term === newEntry.term)
        ).length;
        
        if (replicatedCount >= Math.floor(aliveNodes.length / 2) + 1) {
          return {
            ...prevState,
            nodes: replicatedNodes.map(node => ({
              ...node,
              log: node.log.map(entry => 
                entry.index === newEntry.index && entry.term === newEntry.term
                  ? { ...entry, committed: true }
                  : entry
              ),
              commitIndex: Math.max(node.commitIndex, newEntry.index)
            }))
          };
        }
        
        return { ...prevState, nodes: replicatedNodes };
      });
    }, 1000);
  }, [state.nodes, updateState]);

  const handleNodeAction = useCallback((nodeId: string, action: string) => {
    const updatedNodes = state.nodes.map(node => {
      if (node.nodeId === nodeId) {
        switch (action) {
          case 'remove':
            return null;
          case 'fail':
            return { 
              ...node, 
              isAlive: false, 
              state: 'follower' as const,
              votes: 0
            };
          case 'restart':
            return { 
              ...node, 
              isAlive: true, 
              state: 'follower' as const, 
              term: Math.max(...state.nodes.map(n => n.term), 0),
              votes: 0,
              votedFor: null,
              isPartitioned: false
            };
          case 'partition':
            return { ...node, isPartitioned: !node.isPartitioned };
          default:
            return node;
        }
      }
      return node;
    });

    // Filter out removed nodes
    const filteredNodes = updatedNodes.filter((node): node is Node => node !== null);
    updateState({ nodes: filteredNodes });

    // Trigger new election if leader failed
    if (action === 'fail') {
      const failedNode = state.nodes.find(n => n.nodeId === nodeId);
      if (failedNode?.state === 'leader') {
        setTimeout(() => handleStartElection(), 1000);
      }
    }
  }, [state.nodes, updateState, handleStartElection]);

  const handleToggleChaos = useCallback(() => {
    updateState({ chaosMode: !state.chaosMode });
    
    if (!state.chaosMode) {
      const chaosInterval = setInterval(() => {
        setState(prevState => {
          if (!prevState.chaosMode) {
            clearInterval(chaosInterval);
            return prevState;
          }

          if (Math.random() < 0.15) { // 15% chance
            const aliveNodes = prevState.nodes.filter(n => n.isAlive);
            if (aliveNodes.length > 1) {
              const randomNode = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
              const action = Math.random() > 0.7 ? 'fail' : 'partition';
              
              return {
                ...prevState,
                nodes: prevState.nodes.map(node => 
                  node.nodeId === randomNode.nodeId
                    ? action === 'fail' 
                      ? { ...node, isAlive: false, state: 'follower' as const }
                      : { ...node, isPartitioned: !node.isPartitioned }
                    : node
                )
              };
            }
          }
          return prevState;
        });
      }, 5000);

      (window as any).chaosInterval = chaosInterval;
    } else {
      if ((window as any).chaosInterval) {
        clearInterval((window as any).chaosInterval);
        delete (window as any).chaosInterval;
      }
    }
  }, [state.chaosMode, updateState]);

  const handlePageChange = useCallback((page: string) => {
    updateState({ currentPage: page });
  }, [updateState]);

  // Handlers object
  const handlers = {
    handleNodeSelect,
    handleAddSampleNodes,
    handleStartElection,
    handleAddLogEntry,
    handleNodeAction,
    handleToggleChaos
  };

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md w-full text-center text-white">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold mb-4">Application Error</h2>
          <p className="mb-6 opacity-90">{state.error}</p>
          <button
            onClick={() => updateState({ error: null })}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Retry
          </button>
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
        return <LogsPage state={state} handlers={handlers} />;
      case 'performance':
        return <PerformancePage state={state} handlers={handlers} />;
      case 'chaos':
        return <ChaosPage state={state} handlers={handlers} />;
      case 'settings':
        return <SettingsPage state={state} handlers={handlers} />;
      default:
        return <Dashboard state={state} handlers={handlers} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">🔗</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Raft Consensus Simulator</h1>
                  <p className="text-sm text-gray-300">Interactive Distributed Systems Visualization</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Help Button */}
                <button
                  onClick={() => updateState({ showHelp: true })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  📚 How to Use
                </button>

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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    state.chaosMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
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

        <Navigation
          currentPage={state.currentPage}
          onPageChange={handlePageChange}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {renderCurrentPage()}
        </div>

        {/* Help Modal */}
        <HowToUse 
          isOpen={state.showHelp} 
          onClose={() => updateState({ showHelp: false })} 
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;