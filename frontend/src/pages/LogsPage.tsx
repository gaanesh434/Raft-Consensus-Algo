import React, { useState } from 'react';
import { MessageLog } from '../components/MessageLog';

interface LogsPageProps {
  state: any;
}

export const LogsPage: React.FC<LogsPageProps> = ({ state }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = state.messages.filter((message: any) => {
    const matchesFilter = filter === 'all' || message.type === filter;
    const matchesSearch = searchTerm === '' || 
      message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const messageTypes = ['all', 'heartbeat', 'vote_request', 'vote_response', 'append_entries'];

  return (
    <div className="space-y-6">
      {/* Log Controls */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Log Analysis</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {messageTypes.map((type) => (
                <option key={type} value={type} className="bg-gray-800">
                  {type === 'all' ? 'All Messages' : type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        {messageTypes.slice(1).map((type) => {
          const count = state.messages.filter((m: any) => m.type === type).length;
          return (
            <div key={type} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-300 capitalize">
                  {type.replace('_', ' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Log */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Message History ({filteredMessages.length} messages)
          </h3>
          <button
            onClick={() => {
              setFilter('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📭</div>
              <div>No messages match your filters</div>
            </div>
          ) : (
            filteredMessages.reverse().map((message: any, index: number) => (
              <div
                key={`${message.timestamp}-${index}`}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {message.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {message.success !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.success 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {message.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300">
                  <span className="font-medium">{message.from}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium">{message.to}</span>
                  <span className="ml-4 text-gray-500">Term: {message.term}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};