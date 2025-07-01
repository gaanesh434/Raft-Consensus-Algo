import React, { useState } from 'react';

interface ControlPanelProps {
  socket: any;
  connected: boolean;
  nodes: any[];
  onAddSampleNodes: () => void;
  onStartElection: () => void;
  onAddLogEntry: (command: string) => void;
  onNodeAction: (nodeId: string, action: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  socket,
  connected,
  nodes,
  onAddSampleNodes,
  onStartElection,
  onAddLogEntry,
  onNodeAction
}) => {
  const [newNodeId, setNewNodeId] = useState('');
  const [logCommand, setLogCommand] = useState('');

  const handleAddNode = () => {
    if (!newNodeId.trim()) return;
    
    // In demo mode, just add sample nodes
    onAddSampleNodes();
    setNewNodeId('');
  };

  const handleAddLogEntry = () => {
    if (!logCommand.trim()) return;
    
    onAddLogEntry(logCommand);
    setLogCommand('');
  };

  return (
    <div className="space-y-6">
      {/* Add Node */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">➕</span>
          Add Node
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            placeholder="Node ID (e.g., node-4)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
          />
          <button
            onClick={handleAddNode}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
          >
            Add Node
          </button>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          Quick Start
        </h3>
        <button
          onClick={onAddSampleNodes}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200"
        >
          Add Sample Node
        </button>
      </div>

      {/* Cluster Operations */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Cluster Operations
        </h3>
        <div className="space-y-4">
          <button
            onClick={onStartElection}
            disabled={nodes.filter(n => n.isAlive).length < 2}
            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            Start Election
          </button>
          
          <input
            type="text"
            value={logCommand}
            onChange={(e) => setLogCommand(e.target.value)}
            placeholder="Log command (e.g., SET x=1)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddLogEntry()}
          />
          <button
            onClick={handleAddLogEntry}
            disabled={!logCommand.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            Add Log Entry
          </button>
        </div>
      </div>

      {/* Node Management */}
      {nodes.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            Node Management
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {nodes.map((node) => (
              <div
                key={node.nodeId}
                className="bg-white/10 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{node.nodeId}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      !node.isAlive ? 'bg-red-500' :
                      node.state === 'leader' ? 'bg-green-500' :
                      node.state === 'candidate' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-xs text-gray-300 capitalize">{node.state}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNodeAction(node.nodeId, node.isAlive ? 'fail' : 'restart')}
                    className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                      node.isAlive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {node.isAlive ? 'Fail' : 'Restart'}
                  </button>
                  <button
                    onClick={() => onNodeAction(node.nodeId, 'partition')}
                    disabled={!node.isAlive}
                    className="px-3 py-2 text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Partition
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};