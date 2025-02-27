import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, BarChart2, Settings, XCircle, MessageSquare, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Tab {
  id: string;
  icon: React.ElementType;
  label: string;
  requiresAuth?: boolean;
}

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isAuthenticated?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange,
  isAuthenticated = false
}) => {
  const tabs: Tab[] = [
    { id: 'upload', icon: Upload, label: 'Upload', requiresAuth: true },
    { id: 'search', icon: Search, label: 'Search', requiresAuth: true },
    { id: 'stats', icon: BarChart2, label: 'Statistics' },
    { id: 'chat', icon: MessageSquare, label: 'Chat', requiresAuth: true },
    { id: 'configs', icon: Settings, label: 'Configs', requiresAuth: true },
    { id: 'resources', icon: BookOpen, label: 'Resources' } // No requiresAuth flag
  ];

  const handleTabClick = (tab: Tab) => {
    if (tab.requiresAuth && !isAuthenticated) {
      // Play buzzer sound
      const audio = new Audio('data:audio/wav;base64,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');
      audio.play();

      // Show error toast
      toast.error('Please sign in to access this feature', {
        icon: '🔒',
        duration: 2000
      });
      return;
    }
    onTabChange(tab.id);
  };

  return (
    <div className="container mx-auto px-4 mb-8">
      <motion.div 
        className="flex justify-center space-x-4 bg-gray-800/50 p-2 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {tabs.map(tab => (
          <motion.div
            key={tab.id}
            className="relative"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
                }
                ${tab.requiresAuth && !isAuthenticated ? 'opacity-50' : ''}
              `}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </motion.button>

            {/* Red X overlay for unauthorized tabs */}
            <AnimatePresence>
              {tab.requiresAuth && !isAuthenticated && activeTab === tab.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <XCircle className="text-red-500 w-8 h-8" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};