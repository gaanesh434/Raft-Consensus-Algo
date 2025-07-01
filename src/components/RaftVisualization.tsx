import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Node {
  nodeId: string;
  state: 'follower' | 'candidate' | 'leader';
  term: number;
  isAlive: boolean;
  position: { x: number; y: number };
  votes: number;
  log: any[];
  commitIndex: number;
  lastApplied: number;
  votedFor: string | null;
  lastHeartbeat: string;
  isPartitioned?: boolean;
}

interface Message {
  type: string;
  from: string;
  to: string;
  term: number;
  timestamp: string;
  success?: boolean;
}

interface RaftVisualizationProps {
  nodes: Node[];
  messages: Message[];
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onAddSampleNodes: () => void;
}

export const RaftVisualization: React.FC<RaftVisualizationProps> = ({
  nodes,
  messages,
  selectedNode,
  onNodeSelect,
  onAddSampleNodes
}) => {
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [animatedMessages, setAnimatedMessages] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Animate messages flowing between nodes
  useEffect(() => {
    const recentMessages = messages.slice(-5);
    const animated = recentMessages.map((msg, index) => ({
      ...msg,
      id: `${msg.timestamp}-${index}`,
      opacity: Math.max(0.3, 1 - (index / 5)),
      delay: index * 0.2
    }));
    setAnimatedMessages(animated);
  }, [messages]);

  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeSelect(nodeId === selectedNode ? null : nodeId);
  }, [selectedNode, onNodeSelect]);

  const getNodeColor = (node: Node) => {
    if (!node.isAlive) return 'from-red-500 to-red-700 opacity-60';
    switch (node.state) {
      case 'leader': return 'from-emerald-400 to-emerald-600 shadow-emerald-500/50';
      case 'candidate': return 'from-amber-400 to-amber-600 shadow-amber-500/50';
      default: return 'from-blue-400 to-blue-600 shadow-blue-500/50';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'leader': return '👑';
      case 'candidate': return '🗳️';
      default: return '👤';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'heartbeat': return '#10b981';
      case 'vote_request': return '#f59e0b';
      case 'vote_response': return '#8b5cf6';
      case 'append_entries': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
      {/* Header with Help */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Cluster Visualization</h2>
          <p className="text-gray-300 text-sm">Interactive Raft consensus network</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Show help"
          >
            ❓ Help
          </button>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg"></div>
              <span className="text-gray-300">Leader</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-lg"></div>
              <span className="text-gray-300">Candidate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              <span className="text-gray-300">Follower</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-700 rounded-full opacity-60"></div>
              <span className="text-gray-300">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
          >
            <h3 className="text-white font-semibold mb-2">🎯 How to Use</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p><strong>Click nodes:</strong> Select to view details</p>
                <p><strong>Leader (👑):</strong> Manages cluster state</p>
                <p><strong>Candidate (🗳️):</strong> Requesting votes</p>
              </div>
              <div>
                <p><strong>Follower (👤):</strong> Following leader</p>
                <p><strong>Pulse animation:</strong> Active leader</p>
                <p><strong>Lines:</strong> Network connections</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Visualization Canvas */}
      <div 
        className="relative bg-gradient-to-br from-slate-900/80 to-purple-900/20 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        {nodes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center text-gray-400">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-8xl mb-6"
              >
                🔗
              </motion.div>
              <div className="text-2xl font-bold mb-3 text-white">No nodes in cluster</div>
              <div className="text-lg mb-8 opacity-80">Start by adding nodes to see the magic happen</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddSampleNodes}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ✨ Add Sample Nodes
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Connection lines with glow effect */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {nodes.map((fromNode) =>
                nodes
                  .filter((toNode) => toNode.nodeId !== fromNode.nodeId && fromNode.isAlive && toNode.isAlive && !fromNode.isPartitioned && !toNode.isPartitioned)
                  .map((toNode) => (
                    <motion.line
                      key={`${fromNode.nodeId}-${toNode.nodeId}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ duration: 1, delay: 0.5 }}
                      x1={fromNode.position.x}
                      y1={fromNode.position.y}
                      x2={toNode.position.x}
                      y2={toNode.position.y}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="2"
                      strokeDasharray="8,4"
                      filter="url(#glow)"
                    />
                  ))
              )}
              
              {/* Animated message flows */}
              {animatedMessages.map((message) => {
                const fromNode = nodes.find(n => n.nodeId === message.from);
                const toNode = nodes.find(n => n.nodeId === message.to);
                if (!fromNode || !toNode) return null;
                
                const angle = Math.atan2(toNode.position.y - fromNode.position.y, toNode.position.x - fromNode.position.x);
                const distance = Math.sqrt(Math.pow(toNode.position.x - fromNode.position.x, 2) + Math.pow(toNode.position.y - fromNode.position.y, 2));
                
                return (
                  <g key={message.id}>
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: message.delay }}
                      x1={fromNode.position.x}
                      y1={fromNode.position.y}
                      x2={toNode.position.x}
                      y2={toNode.position.y}
                      stroke={getMessageColor(message.type)}
                      strokeWidth="3"
                      opacity={message.opacity}
                      filter="url(#glow)"
                    />
                    <motion.circle
                      initial={{ 
                        cx: fromNode.position.x, 
                        cy: fromNode.position.y,
                        opacity: 0 
                      }}
                      animate={{ 
                        cx: toNode.position.x, 
                        cy: toNode.position.y,
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 1, 
                        delay: message.delay,
                        ease: "easeInOut"
                      }}
                      r="4"
                      fill={getMessageColor(message.type)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes with enhanced animations */}
            {nodes.map((node, index) => (
              <motion.div
                key={node.nodeId}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  absolute w-24 h-24 rounded-full cursor-pointer transition-all duration-300
                  bg-gradient-to-br ${getNodeColor(node)}
                  ${selectedNode === node.nodeId ? 'ring-4 ring-purple-400 ring-opacity-75 scale-110' : ''}
                  flex flex-col items-center justify-center text-white font-bold text-xs
                  shadow-2xl hover:shadow-3xl border-2 border-white/20
                `}
                style={{
                  left: node.position.x - 48,
                  top: node.position.y - 48,
                }}
                onClick={() => handleNodeClick(node.nodeId)}
              >
                {/* Node content */}
                <motion.div 
                  animate={{ rotate: node.state === 'leader' ? [0, 5, -5, 0] : 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl mb-1"
                >
                  {getStateIcon(node.state)}
                </motion.div>
                <div className="text-center leading-tight">
                  <div className="text-xs font-bold">{node.nodeId}</div>
                  <div className="text-xs opacity-80">T:{node.term}</div>
                </div>
                
                {/* Leader pulse animation */}
                {node.state === 'leader' && node.isAlive && (
                  <>
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 0, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-300"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-400"
                    />
                  </>
                )}
                
                {/* Partition indicator */}
                {node.isPartitioned && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs shadow-lg"
                  >
                    🚫
                  </motion.div>
                )}
                
                {/* Vote count for candidates */}
                {node.state === 'candidate' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white"
                  >
                    {node.votes}
                  </motion.div>
                )}

                {/* Health indicator */}
                <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
                  node.isAlive ? 'bg-green-400' : 'bg-red-500'
                } shadow-lg`} />
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-300">
          <span>Nodes: <strong className="text-white">{nodes.length}</strong></span>
          <span>Leader: <strong className="text-emerald-400">
            {nodes.find(n => n.state === 'leader')?.nodeId || 'None'}
          </strong></span>
          <span>Term: <strong className="text-white">
            {Math.max(...nodes.map(n => n.term), 0)}
          </strong></span>
        </div>
        <div className="text-gray-400">
          Click nodes to inspect • Watch the consensus in action
        </div>
      </div>
    </div>
  );
};