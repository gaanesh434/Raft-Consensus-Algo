import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComponentTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ComponentTooltip: React.FC<ComponentTooltipProps> = ({
  children,
  title,
  description,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className="bg-slate-800 border border-white/20 rounded-lg p-3 shadow-2xl backdrop-blur-sm max-w-xs">
              <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
              <p className="text-gray-300 text-xs">{description}</p>
              
              {/* Arrow */}
              <div className={`absolute w-2 h-2 bg-slate-800 border-white/20 transform rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-b border-r' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-t border-l' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r' :
                'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l'
              }`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};