import React from 'react';

interface Message {
  type: string;
  from: string;
  to: string;
  term: number;
  timestamp: string;
  success?: boolean;
  data?: any;
}

interface MessageLogProps {
  messages: Message[];
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const recentMessages = messages.slice(-15).reverse();

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'heartbeat': return '💓';
      case 'vote_request': return '🗳️';
      case 'vote_response': return '✅';
      case 'append_entries': return '📝';
      case 'append_entries_response': return '📋';
      default: return '📨';
    }
  };

  const getMessageColor = (type: string, success?: boolean) => {
    if (success === false) return 'text-red-400 border-red-400/30';
    
    switch (type) {
      case 'heartbeat': return 'text-green-400 border-green-400/30';
      case 'vote_request': return 'text-yellow-400 border-yellow-400/30';
      case 'vote_response': return 'text-purple-400 border-purple-400/30';
      case 'append_entries': return 'text-blue-400 border-blue-400/30';
      case 'append_entries_response': return 'text-cyan-400 border-cyan-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="mr-2">📨</span>
        Message Log
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {recentMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">📭</div>
            <div className="text-sm">No messages yet</div>
          </div>
        ) : (
          recentMessages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={`
                bg-white/5 rounded-lg p-3 border transition-all duration-200 hover:bg-white/10
                ${getMessageColor(message.type, message.success)}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMessageIcon(message.type)}</span>
                  <span className="font-medium text-sm">
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
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div className="text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="font-medium bg-white/10 px-2 py-1 rounded">
                    {message.from}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium bg-white/10 px-2 py-1 rounded">
                    {message.to}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span>Term: {message.term}</span>
                </div>
                
                {message.data && Object.keys(message.data).length > 0 && (
                  <div className="mt-2 text-xs bg-white/5 rounded p-2">
                    <div className="font-medium mb-1">Data:</div>
                    <pre className="text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};