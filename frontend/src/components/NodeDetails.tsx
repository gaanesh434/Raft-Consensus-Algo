import React from 'react';

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

interface NodeDetailsProps {
  node?: Node;
  onNodeAction: (nodeId: string, action: string) => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onNodeAction }) => {
  if (!node) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Node Details</h3>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">👆</div>
          <div className="text-sm">Select a node to view details</div>
        </div>
      </div>
    );
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'leader': return 'text-green-400 bg-green-400/20';
      case 'candidate': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'leader': return '👑';
      case 'candidate': return '🗳️';
      default: return '👤';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Node Details</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(node.state)}`}>
          {getStateIcon(node.state)} {node.state.toUpperCase()}
        </div>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Basic Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Node ID:</span>
              <div className="text-white font-medium">{node.nodeId}</div>
            </div>
            <div>
              <span className="text-gray-400">Term:</span>
              <div className="text-white font-medium">{node.term}</div>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <div className={`font-medium ${node.isAlive ? 'text-green-400' : 'text-red-400'}`}>
                {node.isAlive ? 'Alive' : 'Failed'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Votes:</span>
              <div className="text-white font-medium">{node.votes}</div>
            </div>
          </div>
        </div>

        {/* Voting Info */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Voting Information</h4>
          <div className="text-sm">
            <div className="mb-2">
              <span className="text-gray-400">Voted For:</span>
              <div className="text-white font-medium">
                {node.votedFor || 'None'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Last Heartbeat:</span>
              <div className="text-white font-medium">
                {formatTime(node.lastHeartbeat)}
              </div>
            </div>
          </div>
        </div>

        {/* Log Information */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Log Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Log Entries:</span>
              <div className="text-white font-medium">{node.log.length}</div>
            </div>
            <div>
              <span className="text-gray-400">Commit Index:</span>
              <div className="text-white font-medium">{node.commitIndex}</div>
            </div>
            <div>
              <span className="text-gray-400">Last Applied:</span>
              <div className="text-white font-medium">{node.lastApplied}</div>
            </div>
            <div>
              <span className="text-gray-400">Consistency:</span>
              <div className="text-green-400 font-medium">
                {node.commitIndex >= 0 ? 'Consistent' : 'Syncing'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Log Entries */}
        {node.log.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Recent Log Entries</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {node.log.slice(-3).map((entry, index) => (
                <div key={index} className="bg-white/10 rounded p-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {entry.command || `Entry ${entry.index}`}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      entry.committed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {entry.committed ? 'Committed' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-gray-400 mt-1">
                    Term: {entry.term} • Index: {entry.index}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNodeAction(node.nodeId, node.isAlive ? 'fail' : 'restart')}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                node.isAlive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {node.isAlive ? 'Fail Node' : 'Restart Node'}
            </button>
            <button
              onClick={() => onNodeAction(node.nodeId, 'partition')}
              disabled={!node.isAlive}
              className="px-3 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Toggle Partition
            </button>
          </div>
        </div>

        {/* Network Status */}
        {node.isPartitioned && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-orange-400 text-lg">🚫</span>
              <div>
                <div className="text-orange-400 font-medium">Network Partitioned</div>
                <div className="text-orange-300 text-sm">
                  This node is isolated from the cluster
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};