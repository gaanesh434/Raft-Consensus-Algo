import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '../components/PerformanceMonitor';

interface PerformancePageProps {
  state: any;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({ state }) => {
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    if (state.performanceStats) {
      setPerformanceHistory(prev => {
        const newHistory = [...prev, {
          ...state.performanceStats,
          timestamp: Date.now()
        }];
        
        // Keep only last 100 entries
        return newHistory.slice(-100);
      });
    }
  }, [state.performanceStats]);

  const getFilteredHistory = () => {
    const now = Date.now();
    const ranges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000
    };
    
    const range = ranges[timeRange as keyof typeof ranges] || ranges['1h'];
    return performanceHistory.filter(entry => now - entry.timestamp <= range);
  };

  const filteredHistory = getFilteredHistory();

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          {state.performanceStats && (
            <PerformanceMonitor stats={state.performanceStats} />
          )}
        </div>
        
        <div className="col-span-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="5m" className="bg-gray-800">Last 5 minutes</option>
                <option value="15m" className="bg-gray-800">Last 15 minutes</option>
                <option value="1h" className="bg-gray-800">Last hour</option>
                <option value="6h" className="bg-gray-800">Last 6 hours</option>
              </select>
            </div>
            
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {/* Memory Usage Chart */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Memory Usage Over Time</h4>
                  <div className="h-32 flex items-end space-x-1">
                    {filteredHistory.slice(-20).map((entry, index) => {
                      const percentage = (entry.memoryUsage.heapUsed / entry.memoryUsage.heapTotal) * 100;
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t flex-1"
                          style={{ height: `${percentage}%` }}
                          title={`${percentage.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Node Count Chart */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Node Count Over Time</h4>
                  <div className="h-32 flex items-end space-x-1">
                    {filteredHistory.slice(-20).map((entry, index) => {
                      const maxNodes = Math.max(...filteredHistory.map(e => e.nodeCount), 1);
                      const percentage = (entry.nodeCount / maxNodes) * 100;
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-green-600 to-emerald-600 rounded-t flex-1"
                          style={{ height: `${percentage}%` }}
                          title={`${entry.nodeCount} nodes`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📊</div>
                <div>No performance data available</div>
                <div className="text-sm">Data will appear as the system runs</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h3>
        
        {state.performanceStats ? (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">System Information</h4>
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">RSS Memory:</span>
                  <span className="text-white">{(state.performanceStats.memoryUsage.rss / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Heap Used:</span>
                  <span className="text-white">{(state.performanceStats.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Heap Total:</span>
                  <span className="text-white">{(state.performanceStats.memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">External:</span>
                  <span className="text-white">{(state.performanceStats.memoryUsage.external / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-medium">Cluster Statistics</h4>
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Active Nodes:</span>
                  <span className="text-white">{state.nodes.filter((n: any) => n.isAlive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Failed Nodes:</span>
                  <span className="text-white">{state.nodes.filter((n: any) => !n.isAlive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Current Leader:</span>
                  <span className="text-white">
                    {state.nodes.find((n: any) => n.state === 'leader')?.nodeId || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Messages/Min:</span>
                  <span className="text-white">
                    {Math.round(state.messages.length / Math.max(state.performanceStats.uptime / 60, 1))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">⏳</div>
            <div>Loading performance data...</div>
          </div>
        )}
      </div>
    </div>
  );
};