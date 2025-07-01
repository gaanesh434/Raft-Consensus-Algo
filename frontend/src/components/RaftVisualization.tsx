import React, { useState, useCallback, useRef, useEffect } from 'react';

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [animatedMessages, setAnimatedMessages] = useState<any[]>([]);

  // Animate messages
  useEffect(() => {
    const recentMessages = messages.slice(-5);
    const animated = recentMessages.map((msg, index) => ({
      ...msg,
      id: `${msg.timestamp}-${index}`,
      opacity: Math.max(0.2, 1 - (index / 5))
    }));
    setAnimatedMessages(animated);
  }, [messages]);

  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeSelect(nodeId === selectedNode ? null : nodeId);
  }, [selectedNode, onNodeSelect]);

  const getNodeColor = (node: Node) => {
    if (!node.isAlive) return 'bg-red-500 opacity-60';
    switch (node.state) {
      case 'leader': return 'bg-green-500 shadow-green-500/50';
      case 'candidate': return 'bg-yellow-500 shadow-yellow-500/50';
      default: return 'bg-blue-500 shadow-blue-500/50';
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
      case 'heartbeat': return 'stroke-green-400';
      case 'vote_request': return 'stroke-yellow-400';
      case 'vote_response': return 'stroke-purple-400';
      case 'append_entries': return 'stroke-blue-400';
      default: return 'stroke-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Cluster Visualization</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <span className="text-gray-300">Leader</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
            <span className="text-gray-300">Candidate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            <span className="text-gray-300">Follower</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full opacity-60"></div>
            <span className="text-gray-300">Failed</span>
          </div>
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 overflow-hidden"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">🔗</div>
              <div className="text-xl font-medium mb-2">No nodes in cluster</div>
              <div className="text-sm mb-6 opacity-80">Add nodes to start the simulation</div>
              <button
                onClick={onAddSampleNodes}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Add Sample Nodes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Connection lines */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              {nodes.map((fromNode) =>
                nodes
                  .filter((toNode) => toNode.nodeId !== fromNode.nodeId && fromNode.isAlive && toNode.isAlive)
                  .map((toNode) => (
                    <line
                      key={`${fromNode.nodeId}-${toNode.nodeId}`}
                      x1={fromNode.position.x}
                      y1={fromNode.position.y}
                      x2={toNode.position.x}
                      y2={toNode.position.y}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                  ))
              )}
              
              {/* Animated messages */}
              {animatedMessages.map((message) => {
                const fromNode = nodes.find(n => n.nodeId === message.from);
                const toNode = nodes.find(n => n.nodeId === message.to);
                if (!fromNode || !toNode) return null;
                
                return (
                  <g key={message.id} opacity={message.opacity}>
                    <line
                      x1={fromNode.position.x}
                      y1={fromNode.position.y}
                      x2={toNode.position.x}
                      y2={toNode.position.y}
                      className={getMessageColor(message.type)}
                      strokeWidth="2"
                    />
                    <circle
                      cx={fromNode.position.x + (toNode.position.x - fromNode.position.x) * 0.7}
                      cy={fromNode.position.y + (toNode.position.y - fromNode.position.y) * 0.7}
                      r="3"
                      className={getMessageColor(message.type).replace('stroke', 'fill')}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.nodeId}
                className={`
                  absolute w-20 h-20 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110
                  ${getNodeColor(node)}
                  ${selectedNode === node.nodeId ? 'ring-4 ring-purple-400 ring-opacity-75 scale-110' : ''}
                  flex flex-col items-center justify-center text-white font-bold text-xs
                  shadow-lg
                `}
                style={{
                  left: node.position.x - 40,
                  top: node.position.y - 40,
                }}
                onClick={() => handleNodeClick(node.nodeId)}
              >
                <div className="text-lg mb-1">{getStateIcon(node.state)}</div>
                <div className="text-center leading-tight">
                  <div className="text-xs font-bold">{node.nodeId}</div>
                  <div className="text-xs opacity-80">T:{node.term}</div>
                </div>
                
                {/* Leader pulse animation */}
                {node.state === 'leader' && node.isAlive && (
                  <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping"></div>
                )}
                
                {/* Partition indicator */}
                {node.isPartitioned && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-xs">
                    🚫
                  </div>
                )}
                
                {/* Vote count for candidates */}
                {node.state === 'candidate' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {node.votes}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};