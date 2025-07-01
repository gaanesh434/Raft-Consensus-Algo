import React, { useState } from 'react';

interface ChaosPageProps {
  state: any;
  handlers: any;
}

export const ChaosPage: React.FC<ChaosPageProps> = ({ state, handlers }) => {
  const [chaosConfig, setChaosConfig] = useState({
    nodeFailureRate: 0.1,
    networkPartitionRate: 0.05,
    messageDropRate: 0.02,
    recoveryRate: 0.3
  });

  const handleConfigChange = (key: string, value: number) => {
    setChaosConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyConfig = () => {
    if (state.socket) {
      state.socket.emit('update-chaos-config', chaosConfig);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chaos Status */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Chaos Engineering</h2>
            <p className="text-gray-300">
              Test your cluster's resilience by introducing controlled failures
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg font-medium ${
              state.chaosMode 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {state.chaosMode ? '🔥 Chaos Active' : '🛡️ Chaos Inactive'}
            </div>
            <button
              onClick={handlers.handleToggleChaos}
              disabled={!state.connected}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                state.chaosMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {state.chaosMode ? 'Stop Chaos' : 'Start Chaos'}
            </button>
          </div>
        </div>
      </div>

      {/* Chaos Configuration */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Chaos Configuration</h3>
          
          <div className="space-y-6">
            {/* Node Failure Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Node Failure Rate: {(chaosConfig.nodeFailureRate * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={chaosConfig.nodeFailureRate}
                onChange={(e) => handleConfigChange('nodeFailureRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Network Partition Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Network Partition Rate: {(chaosConfig.networkPartitionRate * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={chaosConfig.networkPartitionRate}
                onChange={(e) => handleConfigChange('networkPartitionRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Message Drop Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message Drop Rate: {(chaosConfig.messageDropRate * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                value={chaosConfig.messageDropRate}
                onChange={(e) => handleConfigChange('messageDropRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Recovery Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recovery Rate: {(chaosConfig.recoveryRate * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={chaosConfig.recoveryRate}
                onChange={(e) => handleConfigChange('recoveryRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={applyConfig}
              disabled={!state.connected}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Apply Configuration
            </button>
          </div>
        </div>

        {/* Chaos Scenarios */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Chaos Scenarios</h3>
          
          <div className="space-y-4">
            {[
              {
                name: 'Split Brain',
                description: 'Partition the cluster into two groups',
                action: () => {
                  // Implement split brain scenario
                  console.log('Split brain scenario');
                }
              },
              {
                name: 'Leader Failure',
                description: 'Force the current leader to fail',
                action: () => {
                  const leader = state.nodes.find((n: any) => n.state === 'leader');
                  if (leader) {
                    handlers.handleNodeAction(leader.nodeId, 'fail');
                  }
                }
              },
              {
                name: 'Network Storm',
                description: 'Introduce high message drop rates',
                action: () => {
                  setChaosConfig(prev => ({ ...prev, messageDropRate: 0.5 }));
                  applyConfig();
                }
              },
              {
                name: 'Cascade Failure',
                description: 'Fail multiple nodes in sequence',
                action: () => {
                  const aliveNodes = state.nodes.filter((n: any) => n.isAlive);
                  aliveNodes.slice(0, Math.ceil(aliveNodes.length / 2)).forEach((node: any, index: number) => {
                    setTimeout(() => {
                      handlers.handleNodeAction(node.nodeId, 'fail');
                    }, index * 1000);
                  });
                }
              }
            ].map((scenario, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{scenario.name}</h4>
                    <p className="text-gray-300 text-sm">{scenario.description}</p>
                  </div>
                  <button
                    onClick={scenario.action}
                    disabled={!state.connected}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chaos Events Log */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Chaos Events</h3>
        
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">🔥</div>
          <div>Chaos events will appear here</div>
          <div className="text-sm">Start chaos mode to see events</div>
        </div>
      </div>
    </div>
  );
};