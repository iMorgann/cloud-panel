import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Rocket, Cloud, Database, Shield, Target } from 'lucide-react';

interface CelebrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntroText: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: 100 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1.2, 1, 0.8],
      y: [100, 0, 0, -100]
    }}
    transition={{ 
      duration: 3,
      delay,
      times: [0, 0.2, 0.8, 1]
    }}
    className="absolute inset-0 flex items-center justify-center"
  >
    <div className="text-center">
      <motion.h2 
        className="text-4xl md:text-6xl font-bold text-white"
        style={{ 
          textShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'
        }}
      >
        {text}
      </motion.h2>
    </div>
  </motion.div>
);

export const CelebrationDialog: React.FC<CelebrationDialogProps> = ({ isOpen, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
      // Close dialog after animation sequence
      const timer = setTimeout(() => {
        onClose();
      }, 12000); // Total animation duration
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Animated Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-blue-900"
            animate={{
              background: [
                'linear-gradient(to bottom, #1e3a8a, #312e81, #1e3a8a)',
                'linear-gradient(to bottom, #312e81, #4c1d95, #312e81)',
                'linear-gradient(to bottom, #4c1d95, #1e3a8a, #4c1d95)'
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          {/* Floating Icons */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0,
                opacity: 0
              }}
              animate={{ 
                x: [null, Math.random() * window.innerWidth],
                y: [null, Math.random() * window.innerHeight],
                scale: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              {i % 4 === 0 && <Database className="text-blue-400" size={24} />}
              {i % 4 === 1 && <Shield className="text-purple-400" size={24} />}
              {i % 4 === 2 && <Target className="text-green-400" size={24} />}
              {i % 4 === 3 && <Star className="text-yellow-400" size={24} />}
            </motion.div>
          ))}

          {/* Flying Clouds */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute"
              initial={{ 
                x: -100,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{ 
                x: window.innerWidth + 100,
                opacity: [0, 0.2, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 0.8
              }}
            >
              <Cloud 
                className="text-white/20" 
                size={40 + Math.random() * 60}
              />
            </motion.div>
          ))}

          {/* Intro Text Sequence */}
          <AnimatePresence>
            {showContent && (
              <>
                <IntroText 
                  text="ULP Data"
                  delay={1}
                />
                <IntroText 
                  text="7 Various Config Software Assortments"
                  delay={4}
                />
                <IntroText 
                  text="UHQ & Private Methods & Plays"
                  delay={7}
                />
              </>
            )}
          </AnimatePresence>

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/80 hover:bg-white/20 transition-colors"
            onClick={onClose}
          >
            Skip Intro
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};