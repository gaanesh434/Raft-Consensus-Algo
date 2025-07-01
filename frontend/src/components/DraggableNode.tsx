import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { RaftNode } from '../store/slices/raftSlice';

interface DraggableNodeProps {
  node: RaftNode;
  isSelected: boolean;
  onClick: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export const DraggableNode: React.FC<DraggableNodeProps> = ({
  node,
  isSelected,
  onClick,
  onPositionChange,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'node',
    item: { id: node.nodeId, type: 'node' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        onPositionChange(dropResult.position);
      }
    },
  });

  const getNodeColor = () => {
    if (!node.isAlive) return 'bg-red-500';
    switch (node.state) {
      case 'leader': return 'bg-green-500';
      case 'candidate': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStateIcon = () => {
    switch (node.state) {
      case 'leader': return '👑';
      case 'candidate': return '🗳️';
      default: return '👤';
    }
  };

  return (
    <motion.div
      ref={drag}
      className={`
        absolute w-32 h-32 rounded-full cursor-pointer transition-all duration-300
        ${getNodeColor()}
        ${isSelected ? 'ring-4 ring-purple-400 ring-opacity-75' : ''}
        ${isDragging ? 'opacity-50 scale-110' : 'opacity-100 scale-100'}
        ${!node.isAlive ? 'opacity-60' : ''}
        flex flex-col items-center justify-center text-white font-bold
        hover:scale-105 hover:shadow-lg
      `}
      style={{
        left: node.position.x - 64,
        top: node.position.y - 64,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isSelected ? 1.1 : 1,
        boxShadow: isSelected 
          ? '0 0 20px rgba(147, 51, 234, 0.5)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="text-2xl mb-1">{getStateIcon()}</div>
      <div className="text-xs text-center">
        <div>{node.nodeId}</div>
        <div className="text-xs opacity-80">T:{node.term}</div>
        <div className="text-xs opacity-80">V:{node.votes}</div>
      </div>
      
      {/* Pulse animation for leader */}
      {node.state === 'leader' && node.isAlive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-300"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Network partition indicator */}
      {node.isPartitioned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs">
          🚫
        </div>
      )}
    </motion.div>
  );
};