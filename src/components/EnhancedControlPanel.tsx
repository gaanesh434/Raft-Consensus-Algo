import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComponentTooltip } from './ComponentTooltip';

interface ControlPanelProps {
  socket: any;
  connected: boolean;
  nodes: any[];
  onAddSampleNodes: () => void;
  onStartElection: () => void;
  onAddLogEntry: (command: string) => void;
  onNodeAction: (nodeId: string, action: string) => void;
}

export const EnhancedControlPanel: React.FC<ControlPanelProps> = ({
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
  const [expandedSection, setExpandedSection] = useState<string | null>('quick-start');

  const handleAddNode = () => {
    if (!newNodeId.trim()) return;
    onAddSampleNodes();
    setNewNodeId('');
  };

  const handleAddLogEntry = () => {
    if (!logCommand.trim()) return;
    onAddLogEntry(logCommand);
    setLogCommand('');
  };

  const sections = [
    {
      id: 'quick-start',
      title: '🚀 Quick Start',
      description: 'Get started with pre-configured nodes',
      content: (
        <div className="space-y-4">
          <ComponentTooltip
            title="Add Sample Nodes"
            description="Creates a new node with default configuration and adds it to the cluster"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddSampleNodes}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✨ Add Sample Node
            </motion.button>
          </ComponentTooltip>
          
          <div className="text-xs text-gray-400 text-center">
            Adds a new follower node to the cluster
          </div>
        </div>
      )
    },
    {
      id: 'node-management',
      title: '➕ Node Management',
      description: 'Create and manage cluster nodes',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Node ID</label>
            <ComponentTooltip
              title="Node Identifier"
              description="Unique identifier for the new node (e.g., node-4, server-1)"
            >
              <input
                type="text"
                value={newNodeId}
                onChange={(e) => setNewNodeId(e.target.value)}
                placeholder="e.g., node-4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
              />
            </ComponentTooltip>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNode}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
          >
            Add Custom Node
          </motion.button>
        </div>
      )
    },
    {
      id: 'cluster-ops',
      title: '⚡ Cluster Operations',
      description: 'Control cluster behavior and consensus',
      content: (
        <div className="space-y-4">
          <ComponentTooltip
            title="Leader Election"
            description="Triggers a new election process. A random follower will become a candidate and request votes."
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartElection}
              disabled={nodes.filter(n => n.isAlive).length < 2}
              className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg"
            >
              🗳️ Start Election
            </motion.button>
          </ComponentTooltip>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Log Command</label>
            <ComponentTooltip
              title="Log Entry"
              description="Commands to be replicated across the cluster (e.g., SET x=1, DELETE key, UPDATE value)"
            >
              <input
                type="text"
                value={logCommand}
                onChange={(e) => setLogCommand(e.target.value)}
                placeholder="e.g., SET x=1"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleAddLogEntry()}
              />
            </ComponentTooltip>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddLogEntry}
            disabled={!logCommand.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg"
          >
            📝 Add Log Entry
          </motion.button>
        </div>
      )
    },
    {
      id: 'node-actions',
      title: '⚙️ Node Actions',
      description: 'Individual node operations and testing',
      content: (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {nodes.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm">No nodes available</div>
            </div>
          ) : (
            nodes.map((node) => (
              <motion.div
                key={node.nodeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 rounded-lg p-4 border border-white/10 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{node.nodeId}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      !node.isAlive ? 'bg-red-500' :
                      node.state === 'leader' ? 'bg-green-500' :
                      node.state === 'candidate' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                  <span className="text-xs text-gray-300 capitalize bg-white/10 px-2 py-1 rounded">
                    {node.state}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <ComponentTooltip
                    title={node.isAlive ? "Fail Node" : "Restart Node"}
                    description={node.isAlive ? "Simulates a server crash or network failure" : "Brings the failed node back online"}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNodeAction(node.nodeId, node.isAlive ? 'fail' : 'restart')}
                      className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                        node.isAlive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {node.isAlive ? '💥 Fail' : '🔄 Restart'}
                    </motion.button>
                  </ComponentTooltip>
                  
                  <ComponentTooltip
                    title="Network Partition"
                    description="Isolates this node from the rest of the cluster, simulating network split"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNodeAction(node.nodeId, 'partition')}
                      disabled={!node.isAlive}
                      className="px-3 py-2 text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🚫 Partition
                    </motion.button>
                  </ComponentTooltip>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden shadow-xl"
        >
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{section.title}</h3>
                <p className="text-sm text-gray-300">{section.description}</p>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white"
              >
                ▼
              </motion.div>
            </div>
          </button>
          
          <motion.div
            initial={false}
            animate={{
              height: expandedSection === section.id ? 'auto' : 0,
              opacity: expandedSection === section.id ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {section.content}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};