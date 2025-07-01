import React from 'react';
import { Box, Grid, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { EnhancedControlPanel } from '../components/EnhancedControlPanel';
import { RaftVisualization } from '../components/RaftVisualization';
import { MessageLog } from '../components/MessageLog';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { NodeDetails } from '../components/NodeDetails';
import { AppState, Handlers } from '../types';

interface DashboardProps {
  state: AppState;
  handlers: Handlers;
}

export default function Dashboard({ state, handlers }: DashboardProps) {
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Left Sidebar - Enhanced Controls */}
      <Box sx={{ flex: 1 }}>
        <EnhancedControlPanel
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
      </Box>

      {/* Center - Enhanced Visualization */}
      <Box sx={{ flex: 2 }}>
        <RaftVisualization
          nodes={state.nodes}
          messages={state.messages}
          selectedNode={state.selectedNode}
          onNodeSelect={handlers.handleNodeSelect}
          onAddSampleNodes={handlers.handleAddSampleNodes}
        />
      </Box>

      {/* Right Sidebar - Details */}
      <Box sx={{ flex: 1 }}>
        {state.selectedNode && (
          <NodeDetails
            node={state.nodes.find((n: any) => n.nodeId === state.selectedNode)}
            onNodeAction={handlers.handleNodeAction}
          />
        )}
        
        <MessageLog messages={state.messages} />
      </Box>
    </Box>
  );
};