import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Shield } from 'lucide-react';

export const CloudWelcome: React.FC = () => {
  const [currentCloud, setCurrentCloud] = useState(1);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; scale: number }[]>([]);

  const handleClick = () => {
    if (currentCloud === 2) {
      window.dispatchEvent(new Event('footerCloudClicked'));
      const footerButton = document.querySelector('footer button');
      if (footerButton) {
        footerButton.click();
      }
    }
    
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200 - 100,
      scale: Math.random() * 0.5 + 0.5
    }));
    setParticles(newParticles);
    setIsDisappearing(true);
    
    setTimeout(() => {
      setIsDisappearing(false);
      setCurrentCloud(2);
    }, 1000);
  };

  const renderCloud = (cloudNumber: number) => {
    const cloudConfig = {
      1: {
        position: "top-24 left-12",
        icon: Cloud,
        title: "Welcome!",
        description: "Let's explore the Cloud Panel",
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-400",
        glowColor: "bg-blue-400/20"
      },
      2: {
        position: "top-24 right-12",
        icon: Shield,
        title: "The Ultimated Cloud",
        description: "Search By URL; Login - or Password",
        iconBg: "bg-purple-500/20",
        iconColor: "text-purple-400",
        glowColor: "bg-purple-400/20"
      }
    }[cloudNumber];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -100 }}
        className={`fixed ${cloudConfig.position} z-50`}
      >
        {/* Main Cloud Container */}
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
          onClick={handleClick}
        >
          {/* Cloud Content */}
          <motion.div
            className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl cursor-pointer overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            {/* Simpsons-style Light Rays */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={`ray-${i}`}
                  className="absolute top-1/2 left-1/2 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{
                    transform: `rotate(${i * 30}deg) translateX(-50%)`
                  }}
                />
              ))}
            </motion.div>

            <div className="flex items-center space-x-4 relative z-10">
              <div className={`p-3 ${cloudConfig.iconBg} rounded-xl`}>
                <cloudConfig.icon className={`${cloudConfig.iconColor} w-8 h-8`} />
              </div>
              <div>
                <motion.h3 
                  className="text-xl font-bold text-white mb-1"
                  animate={{
                    textShadow: [
                      '0 0 8px rgba(255,255,255,0.5)',
                      '0 0 16px rgba(255,255,255,0.8)',
                      '0 0 8px rgba(255,255,255,0.5)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {cloudConfig.title}
                </motion.h3>
                <p className="text-blue-200/80 text-sm">{cloudConfig.description}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {!isDisappearing ? (
        renderCloud(currentCloud)
      ) : (
        <div className="fixed top-24 left-12 z-50">
          {/* Cloud Particles */}
          {particles.map((particle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: particle.scale,
                x: particle.x,
                y: particle.y,
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 1,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};