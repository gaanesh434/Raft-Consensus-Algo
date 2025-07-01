import React from 'react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const pages = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'visualization', name: 'Visualization', icon: '🔗' },
    { id: 'logs', name: 'Logs', icon: '📋' },
    { id: 'performance', name: 'Performance', icon: '📊' },
    { id: 'chaos', name: 'Chaos Engineering', icon: '🔥' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`
                flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-colors
                ${currentPage === page.id 
                  ? 'text-white border-b-2 border-purple-500' 
                  : 'text-gray-300 hover:text-white'
                }
              `}
            >
              <span>{page.icon}</span>
              <span>{page.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};