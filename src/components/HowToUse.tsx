import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowToUseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToUse({ isOpen, onClose }: HowToUseProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🚀 Getting Started",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Welcome to the Raft Consensus Simulator! This interactive tool helps you understand distributed consensus.</p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">What is Raft?</h4>
            <p className="text-gray-300 text-sm">Raft is a consensus algorithm designed to be easy to understand. It ensures that a cluster of servers agrees on a sequence of commands, even in the presence of failures.</p>
          </div>
        </div>
      )
    },
    {
      title: "🔗 Node States",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">👑</div>
              <div>
                <h4 className="text-emerald-400 font-semibold">Leader</h4>
                <p className="text-gray-300 text-sm">Handles all client requests and replicates log entries to followers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">🗳️</div>
              <div>
                <h4 className="text-amber-400 font-semibold">Candidate</h4>
                <p className="text-gray-300 text-sm">Requesting votes to become the new leader during election</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">👤</div>
              <div>
                <h4 className="text-blue-400 font-semibold">Follower</h4>
                <p className="text-gray-300 text-sm">Responds to requests from leaders and candidates</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "⚡ Core Operations",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">🗳️ Leader Election</h4>
              <p className="text-gray-300 text-sm">When a leader fails or times out, followers become candidates and request votes. The candidate with majority votes becomes the new leader.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">📝 Log Replication</h4>
              <p className="text-gray-300 text-sm">Leaders receive client requests, append them to their log, and replicate entries to followers. Entries are committed once replicated to majority.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">💓 Heartbeats</h4>
              <p className="text-gray-300 text-sm">Leaders send periodic heartbeats to maintain authority and prevent new elections.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🎮 Interactive Controls",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">➕ Add Nodes</h4>
              <p className="text-gray-300 text-sm">Create new nodes to expand your cluster</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">🗳️ Start Election</h4>
              <p className="text-gray-300 text-sm">Trigger a new leader election process</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">📝 Add Log Entry</h4>
              <p className="text-gray-300 text-sm">Submit commands to be replicated across the cluster</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-white font-semibold mb-2">💥 Simulate Failures</h4>
              <p className="text-gray-300 text-sm">Test resilience by failing nodes or creating partitions</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🔥 Chaos Engineering",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Test your cluster's resilience with chaos engineering features:</p>
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="text-red-400 font-semibold mb-2">Node Failures</h4>
              <p className="text-gray-300 text-sm">Simulate server crashes and observe how the cluster recovers</p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h4 className="text-orange-400 font-semibold mb-2">Network Partitions</h4>
              <p className="text-gray-300 text-sm">Create split-brain scenarios and test partition tolerance</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">Message Drops</h4>
              <p className="text-gray-300 text-sm">Simulate network issues and packet loss</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">📚 How to Use Raft Simulator</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">{steps[currentStep].title}</h3>
                {steps[currentStep].content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                ← Previous
              </button>
              
              <span className="text-gray-400">
                {currentStep + 1} of {steps.length}
              </span>
              
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};