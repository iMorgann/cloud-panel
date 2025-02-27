import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Features } from './Features';
import { CelebrationDialog } from './CelebrationDialog';
import { PullUpAnimation } from './PullUpAnimation';

export const Footer: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const [showPullAnimation, setShowPullAnimation] = useState(true);
  const [showElectricOutline, setShowElectricOutline] = useState(false);
  const [completedFeatures, setCompletedFeatures] = useState<number[]>([]);
  const [isShocked, setIsShocked] = useState(false);

  useEffect(() => {
    const handleLightningStrike = () => {
      setShowElectricOutline(true);
      setTimeout(() => setShowElectricOutline(false), 2000);
    };

    window.addEventListener('lightningStrike', handleLightningStrike);
    return () => window.removeEventListener('lightningStrike', handleLightningStrike);
  }, []);

  useEffect(() => {
    const handleFeatureComplete = (event: CustomEvent) => {
      const featureIndex = event.detail.index;
      setCompletedFeatures(prev => {
        const newCompleted = [...new Set([...prev, featureIndex])];
        if (newCompleted.length === 4) {
          setIsShocked(false);
          triggerCelebration();
        }
        return newCompleted;
      });
    };

    window.addEventListener('featureComplete' as any, handleFeatureComplete);
    return () => window.removeEventListener('featureComplete' as any, handleFeatureComplete);
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.8 }
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.8 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { x: 0.5, y: 0.8 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#00BFFF']
      });
    }, 250);
  };

  const handleToggleDrawer = () => {
    const newIsOpen = !isDrawerOpen;
    setIsDrawerOpen(newIsOpen);
    
    window.dispatchEvent(new Event(newIsOpen ? 'footerOpened' : 'footerClosed'));
    
    if (newIsOpen && !hasOpenedBefore) {
      setHasOpenedBefore(true);
      setShowCelebration(true);
      setShowPullAnimation(false);
      setIsShocked(true);
      setShowElectricOutline(true);
      setTimeout(() => setShowElectricOutline(false), 2000);
    }
  };

  return (
    <>
      <motion.footer 
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-700/50 overflow-hidden z-[100]"
        style={{ height: isDrawerOpen ? 'auto' : '3rem' }}
      >
        {/* Electric Outline Animation */}
        <AnimatePresence>
          {showElectricOutline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1, 0.2, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, times: [0, 0.2, 0.3, 0.4, 0.6, 1] }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Lightning Bolts */}
              {isShocked && (
                <motion.div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8],
                        x: Math.random() * 40 - 20,
                        y: Math.random() * 40 - 20
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 0.5,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                    >
                      <Zap 
                        className="text-blue-400"
                        style={{
                          filter: 'drop-shadow(0 0 5px #3B82F6)',
                          transform: `rotate(${Math.random() * 360}deg)`
                        }}
                        size={16}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Electric Border */}
              <div className="absolute inset-0">
                {/* Top Line */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ 
                    scaleX: 1,
                    opacity: [0.3, 1, 0.3],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 origin-left"
                  style={{ boxShadow: '0 0 10px #3B82F6, 0 0 20px #3B82F6' }}
                />

                {/* Left Line */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ 
                    scaleY: 1,
                    opacity: [0.3, 1, 0.3],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                  className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 origin-top"
                  style={{ boxShadow: '0 0 10px #3B82F6, 0 0 20px #3B82F6' }}
                />

                {/* Right Line */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ 
                    scaleY: 1,
                    opacity: [0.3, 1, 0.3],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                  className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 origin-top"
                  style={{ boxShadow: '0 0 10px #3B82F6, 0 0 20px #3B82F6' }}
                />

                {/* Bottom Line */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ 
                    scaleX: 1,
                    opacity: [0.3, 1, 0.3],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6
                  }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 origin-left"
                  style={{ boxShadow: '0 0 10px #3B82F6, 0 0 20px #3B82F6' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawer Toggle Button */}
        <div className="relative">
          {showPullAnimation && <PullUpAnimation />}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleDrawer}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-400 hover:text-white p-1 rounded-full border border-gray-700 transition-colors z-[101]"
          >
            {isDrawerOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </motion.button>
        </div>

        {/* Footer Content */}
        <div className="container mx-auto px-4">
          <div className="h-12 flex items-center justify-center">
            <p className="text-sm text-gray-400">
              Cloud Panel - Advanced Credential & Config Management System
            </p>
          </div>
        </div>

        {/* Drawer Content */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50"
            >
              <div className="container mx-auto px-4 py-6">
                <Features onFeatureComplete={(index) => {
                  window.dispatchEvent(new CustomEvent('featureComplete', { detail: { index } }));
                }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.footer>

      <CelebrationDialog
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
      />
    </>
  );
};