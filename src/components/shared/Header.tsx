import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, User, Users, Activity, Cloud } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { NotificationBell } from './NotificationBell';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  session: Session | null;
  onSignOut: () => Promise<void>;
  onShowAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onSignOut, onShowAuthModal }) => {
  const [onlineUsers, setOnlineUsers] = useState(Math.floor(Math.random() * (20 - 2 + 1)) + 2);
  const [browsingSessions, setBrowsingSessions] = useState(Math.floor(Math.random() * (15 - 5 + 1)) + 5);
  const userIntervalRef = useRef<NodeJS.Timeout>();
  const browsingIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate user count changes
    userIntervalRef.current = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.random() < 0.5 ? -1 : 1;
        const newCount = prev + change;
        return Math.max(2, Math.min(20, newCount));
      });
    }, 10000);

    // Simulate browsing sessions
    browsingIntervalRef.current = setInterval(() => {
      setBrowsingSessions(prev => {
        const change = Math.random() < 0.5 ? -1 : 1;
        const newCount = prev + change;
        return Math.max(5, Math.min(15, newCount));
      });
    }, 5000);

    return () => {
      if (userIntervalRef.current) {
        clearInterval(userIntervalRef.current);
      }
      if (browsingIntervalRef.current) {
        clearInterval(browsingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          {/* Cloud Title Container */}
          <div className="relative">
            {/* Background Glow */}
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-400/10 blur-2xl rounded-full"
              style={{ width: '120%', height: '120%', left: '-10%', top: '-10%' }}
            />

            {/* Cloud Container */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Decorative Clouds */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-6 -right-4"
              >
                <Cloud className="text-white/20" size={24} />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 6, 0],
                  x: [0, -3, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-4 -left-6"
              >
                <Cloud className="text-white/10" size={20} />
              </motion.div>

              {/* Main Cloud Background */}
              <div className="relative px-8 py-4 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                {/* Cloud Particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.2, 0.8],
                      x: Math.random() * 40 - 20,
                      y: Math.random() * 40 - 20
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  >
                    <div className="w-2 h-2 bg-white/20 rounded-full blur-sm" />
                  </motion.div>
                ))}

                {/* Title */}
                <motion.h1 
                  className="text-4xl font-bold relative z-10"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(255,255,255,0.2)',
                      '0 0 30px rgba(255,255,255,0.4)',
                      '0 0 20px rgba(255,255,255,0.2)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Cloud Panel
                </motion.h1>
              </div>
            </motion.div>
          </div>

          {/* Live Traffic Counter */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50">
              <Users className="text-green-400" size={16} />
              <span className="text-sm text-gray-300">{onlineUsers} Online</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50">
              <Activity className="text-blue-400" size={16} />
              <span className="text-sm text-gray-300">{browsingSessions} Browsing</span>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
              />
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          {session ? (
            <div className="flex items-center space-x-4">
              <NotificationBell session={session} />
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 bg-gray-800/50 rounded-full pl-3 pr-4 py-2"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {session.user.email}
                </span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSignOut}
                className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-full transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowAuthModal}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors"
            >
              <LogIn size={18} />
              <span className="text-sm font-medium">Sign In</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};