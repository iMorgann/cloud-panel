import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export const PullUpAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{
          y: [-20, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Pull up text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-center mb-2 text-blue-400 font-medium text-sm whitespace-nowrap"
        >
          Pull up to explore
        </motion.div>

        {/* Animated Arrow */}
        <motion.div
          className="relative"
          animate={{
            y: [-4, 4, -4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full scale-150" />
            
            {/* Arrow icon */}
            <div className="relative bg-blue-500/20 p-2 rounded-full border border-blue-400/30">
              <ChevronUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          {/* Electric particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [-20 - i * 10],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};