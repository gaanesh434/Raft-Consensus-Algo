import React, { useState } from 'react';
import { RaftVisualization } from '../components/RaftVisualization';
import { NodeDetails } from '../components/NodeDetails';

interface VisualizationPageProps {
  state: any;
  handlers: any;
}

export const VisualizationPage: React.FC<VisualizationPageProps> = ({ state, handlers }) => {
  const [viewMode, setViewMode] = useState<'network' | 'timeline' | '3d'>('network');

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Visualization Controls</h2>
          <div className="flex space-x-2">
            {[
              { id: 'network', name: 'Network View', icon: '🔗' },
              { id: 'timeline', name: 'Timeline View', icon: '📈' },
              { id: '3d', name: '3D View', icon: '🎯' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${viewMode === mode.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }
                `}
              >
                {mode.icon} {mode.name}
              </button>
            ))}
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-96">
              <h3 className="text-lg font-semibold text-white mb-4">Timeline View</h3>
              <div className="text-center text-gray-400 py-20">
                <div className="text-4xl mb-2">📈</div>
                <div>Timeline visualization coming soon...</div>
              </div>
            </div>
          )}
          
          {viewMode === '3d' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-96">
              <h3 className="text-lg font-semibold text-white mb-4">3D View</h3>
              <div className="text-center text-gray-400 py-20">
                <div className="text-4xl mb-2">🎯</div>
                <div>3D visualization coming soon...</div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="col-span-1">
          {state.selectedNode && (
            <NodeDetails
              node={state.nodes.find((n: any) => n.nodeId === state.selectedNode)}
              onNodeAction={handlers.handleNodeAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};