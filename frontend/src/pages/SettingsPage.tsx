import React, { useState } from 'react';

interface SettingsPageProps {
  state: any;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ state }) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: 1000,
    maxMessages: 100,
    enableAnimations: true,
    enableSounds: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Appearance</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="dark" className="bg-gray-800">Dark</option>
                <option value="light" className="bg-gray-800">Light</option>
                <option value="auto" className="bg-gray-800">Auto</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Enable Animations</label>
              <button
                onClick={() => handleSettingChange('enableAnimations', !settings.enableAnimations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableAnimations ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Enable Sounds</label>
              <button
                onClick={() => handleSettingChange('enableSounds', !settings.enableSounds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableSounds ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableSounds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Performance</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Auto Refresh</label>
              <button
                onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRefresh ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Refresh Interval: {settings.refreshInterval}ms
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={settings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Messages: {settings.maxMessages}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={settings.maxMessages}
                onChange={(e) => handleSettingChange('maxMessages', parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Settings */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Connection Settings</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Server URL</label>
            <input
              type="text"
              value="http://localhost:3001"
              readOnly
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Connection Status</label>
            <div className={`px-4 py-2 rounded-lg ${
              state.connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {state.connected ? '✅ Connected' : '❌ Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Export Logs
          </button>
          <button className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Export Config
          </button>
          <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Reset All
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">About</h3>
        
        <div className="text-gray-300 space-y-2">
          <p><strong>Raft Consensus Simulator</strong> v2.0.0</p>
          <p>A comprehensive visualization tool for understanding the Raft consensus algorithm.</p>
          <p>Built with React, TypeScript, and Socket.IO</p>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm">
              <a href="https://github.com/yourusername/raft-simulator" className="text-purple-400 hover:text-purple-300">
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};