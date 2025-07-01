import React, { useState } from 'react';
import { RaftVisualization } from '../components/RaftVisualization';
import { NodeDetails } from '../components/NodeDetails';
import { ComponentTooltip } from '../components/ComponentTooltip';
import { AppState, Handlers } from '../types';

interface VisualizationPageProps {
  state: AppState;
  handlers: Handlers;
}

export default function VisualizationPage({ state, handlers }: VisualizationPageProps) {
  const [viewMode, setViewMode] = useState<'network' | 'timeline' | '3d'>('network');
  const [showConnections, setShowConnections] = useState(true);
  const [showMessageFlow, setShowMessageFlow] = useState(true);

  return (
    <div className="space-y-6">
      {/* Enhanced View Controls */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Advanced Visualization</h2>
            <p className="text-gray-300">Explore different views of your Raft cluster</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Selector */}
            <div className="flex space-x-2">
              {[
                { id: 'network', name: 'Network View', icon: '🔗', description: 'Interactive node network with real-time connections' },
                { id: 'timeline', name: 'Timeline View', icon: '📈', description: 'Historical view of consensus events over time' },
                { id: '3d', name: '3D View', icon: '🎯', description: 'Three-dimensional cluster visualization' }
              ].map((mode) => (
                <ComponentTooltip
                  key={mode.id}
                  title={mode.name}
                  description={mode.description}
                >
                  <button
                    onClick={() => setViewMode(mode.id as any)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${viewMode === mode.id 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }
                    `}
                  >
                    {mode.icon} {mode.name}
                  </button>
                </ComponentTooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Options */}
        <div className="flex items-center space-x-6">
          <ComponentTooltip
            title="Connection Lines"
            description="Show/hide network connections between nodes"
          >
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showConnections}
                onChange={(e) => setShowConnections(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
              />
              <span className="text-gray-300">Show Connections</span>
            </label>
          </ComponentTooltip>

          <ComponentTooltip
            title="Message Flow"
            description="Animate message passing between nodes"
          >
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMessageFlow}
                onChange={(e) => setShowMessageFlow(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
              />
              <span className="text-gray-300">Message Flow</span>
            </label>
          </ComponentTooltip>

          <div className="text-gray-400 text-sm">
            Cluster Health: <span className={`font-semibold ${
              state.nodes.filter((n: any) => n.isAlive).length >= Math.floor(state.nodes.length / 2) + 1
                ? 'text-green-400' : 'text-red-400'
            }`}>
              {state.nodes.filter((n: any) => n.isAlive).length >= Math.floor(state.nodes.length / 2) + 1
                ? 'Healthy' : 'Degraded'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Main Visualization */}
        <div className="col-span-3">
          {viewMode === 'network' && (
            <RaftVisualization
              nodes={state.nodes}
              messages={state.messages}
              selectedNode={state.selectedNode}
              onNodeSelect={handlers.handleNodeSelect}
              onAddSampleNodes={handlers.handleAddSampleNodes}
            />
          )}
          
          {viewMode === 'timeline' && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20 h-96">
              <div className="text-center h-full flex items-center justify-center">
                <div>
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Timeline View</h3>
                  <p className="text-gray-300 mb-4">Coming Soon!</p>
                  <div className="text-sm text-gray-400">
                    This will show the historical progression of consensus events,
                    elections, and log replication over time.
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {viewMode === '3d' && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20 h-96">
              <div className="text-center h-full flex items-center justify-center">
                <div>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-white mb-2">3D Visualization</h3>
                  <p className="text-gray-300 mb-4">Coming Soon!</p>
                  <div className="text-sm text-gray-400">
                    This will provide an immersive 3D view of your cluster
                    with spatial representations of network topology.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="col-span-1 space-y-6">
          {state.selectedNode && (
            <NodeDetails
              node={state.nodes.find((n: any) => n.nodeId === state.selectedNode)}
              onNodeAction={handlers.handleNodeAction}
            />
          )}

          {/* Cluster Statistics */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Cluster Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Nodes:</span>
                <span className="text-white font-semibold">{state.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Alive Nodes:</span>
                <span className="text-green-400 font-semibold">
                  {state.nodes.filter((n: any) => n.isAlive).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Failed Nodes:</span>
                <span className="text-red-400 font-semibold">
                  {state.nodes.filter((n: any) => !n.isAlive).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Partitioned:</span>
                <span className="text-orange-400 font-semibold">
                  {state.nodes.filter((n: any) => n.isPartitioned).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Current Term:</span>
                <span className="text-purple-400 font-semibold">
                  {Math.max(...state.nodes.map((n: any) => n.term), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};