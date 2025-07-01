import React from 'react';
import { ControlPanel } from '../components/ControlPanel';
import { RaftVisualization } from '../components/RaftVisualization';
import { MessageLog } from '../components/MessageLog';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { NodeDetails } from '../components/NodeDetails';

interface DashboardProps {
  state: any;
  handlers: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, handlers }) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Sidebar - Controls */}
      <div className="col-span-3 space-y-6">
        <ControlPanel
          socket={state.socket}
          connected={state.connected}
          nodes={state.nodes}
          onAddSampleNodes={handlers.handleAddSampleNodes}
          onStartElection={handlers.handleStartElection}
          onAddLogEntry={handlers.handleAddLogEntry}
          onNodeAction={handlers.handleNodeAction}
        />
        
        {state.performanceStats && (
          <PerformanceMonitor stats={state.performanceStats} />
        )}
      </div>

      {/* Center - Visualization */}
      <div className="col-span-6">
        <RaftVisualization
          nodes={state.nodes}
          messages={state.messages}
          selectedNode={state.selectedNode}
          onNodeSelect={handlers.handleNodeSelect}
          onAddSampleNodes={handlers.handleAddSampleNodes}
        />
      </div>

      {/* Right Sidebar - Details */}
      <div className="col-span-3 space-y-6">
        {state.selectedNode && (
          <NodeDetails
            node={state.nodes.find((n: any) => n.nodeId === state.selectedNode)}
            onNodeAction={handlers.handleNodeAction}
          />
        )}
        
        <MessageLog messages={state.messages} />
      </div>
    </div>
  );
};