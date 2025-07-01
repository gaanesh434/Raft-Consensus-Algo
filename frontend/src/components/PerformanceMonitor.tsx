import React from 'react';

interface PerformanceStats {
  nodeCount: number;
  messageCount: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  uptime: number;
}

interface PerformanceMonitorProps {
  stats: PerformanceStats;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ stats }) => {
  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const memoryUsagePercent = (stats.memoryUsage.heapUsed / stats.memoryUsage.heapTotal) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Performance Monitor
      </h3>
      
      <div className="space-y-4">
        {/* Node Count */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Active Nodes</span>
            <span className="text-white font-bold text-lg">{stats.nodeCount}</span>
          </div>
        </div>

        {/* Message Count */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Messages</span>
            <span className="text-white font-bold text-lg">{stats.messageCount}</span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Memory Usage</span>
              <span className="text-white font-medium">
                {formatBytes(stats.memoryUsage.heapUsed)}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(memoryUsagePercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">
              {memoryUsagePercent.toFixed(1)}% of {formatBytes(stats.memoryUsage.heapTotal)}
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Uptime</span>
            <span className="text-white font-medium">{formatUptime(stats.uptime)}</span>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">System Health</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};