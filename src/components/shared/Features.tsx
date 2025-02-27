import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Box, Target, RefreshCw, Cloud, Database, Settings, FileText, Shield, Lock, Search, Users, CheckCircle, TrendingUp, Zap, ChevronDown, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PullUpAnimation } from './PullUpAnimation';
import { CloudWelcome } from './CloudWelcome';

interface Step {
  title: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  action?: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  isActive: boolean;
  onHover: (index: number | null) => void;
  index: number;
  isClickable: boolean;
  detailedInfo?: React.ReactNode;
  isCompleted: boolean;
  onComplete: (index: number) => void;
}

const ThinkingBubble: React.FC<{ delay: number; scale: number }> = ({ delay, scale }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, scale, 0],
      x: [0, 100, 200],
      y: [0, -50, -100]
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute w-3 h-3 rounded-full bg-blue-400/20 backdrop-blur-sm border border-blue-400/30"
    style={{ left: '10%', top: '50%' }}
  />
);

const ThinkingBubbles: React.FC = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <ThinkingBubble 
        key={i} 
        delay={i * 0.3} 
        scale={1 - (i * 0.1)}
      />
    ))}
  </>
);

const ThinkingCloud: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, y: 20 }}
    className="absolute -bottom-[120px] left-1/2 transform -translate-x-1/2 z-50"
  >
    {/* Thinking Bubbles Path */}
    <motion.div className="absolute -top-[100px] right-full w-[200px] h-[100px]">
      <ThinkingBubbles />
    </motion.div>

    {/* Main Cloud */}
    <motion.div
      className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl"
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.2,
      }}
    >
      {children}

      {/* Small Decorative Clouds */}
      <motion.div
        className="absolute -right-3 -top-2"
        animate={{
          y: [0, -4, 0],
          x: [0, 2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3,
        }}
      >
        <Cloud className="text-blue-400/20 w-3 h-3" />
      </motion.div>

      <motion.div
        className="absolute -left-2 -bottom-1"
        animate={{
          y: [0, 3, 0],
          x: [0, -2, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
      >
        <Cloud className="text-purple-400/20 w-2 h-2" />
      </motion.div>
    </motion.div>

    {/* Connection Line */}
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 30 }}
      transition={{ duration: 0.3 }}
      className="absolute -top-[30px] left-1/2 transform -translate-x-1/2 w-px bg-gradient-to-b from-blue-400/50 to-transparent"
    />
  </motion.div>
);

const DetailedCloudInfo: React.FC = () => (
  <div className="p-3 max-w-[400px]">
    <div className="flex items-center space-x-2 mb-3">
      <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
        <Shield className="text-blue-400 w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Cloud Overview</h3>
        <p className="text-xs text-blue-200/80">Advanced Data Management</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-2 border border-blue-400/20"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-500/20 rounded-lg">
            <Database className="text-blue-400" size={14} />
          </div>
          <div>
            <h4 className="font-semibold text-blue-300 text-xs">Database Stats</h4>
            <div className="flex items-center space-x-1">
              <span className="text-base font-bold text-white">20M+</span>
              <span className="text-xs text-blue-200/80">Entries</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-2 border border-purple-400/20"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-purple-500/20 rounded-lg">
            <TrendingUp className="text-purple-400" size={14} />
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 text-xs">Analysis</h4>
            <div className="flex items-center space-x-1">
              <CheckCircle className="text-green-400" size={12} />
              <span className="text-xs text-purple-200/80">Live Verification</span>
            </div>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-gray-300">
          <div className="flex items-center space-x-1">
            <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
            <span>Cross-referenced</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
            <span>Deduplicated</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-2 border border-green-400/20"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-green-500/20 rounded-lg">
            <Users className="text-green-400" size={14} />
          </div>
          <div>
            <h4 className="font-semibold text-green-300 text-xs">Security</h4>
            <div className="flex items-center space-x-1">
              <Lock className="text-yellow-400" size={12} />
              <span className="text-xs text-green-200/80">Enterprise Grade</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 mt-1">
          <div className="bg-black/20 rounded p-1 text-center">
            <div className="text-xs font-bold text-white">256-bit</div>
            <div className="text-[10px] text-green-200/80">Encryption</div>
          </div>
          <div className="bg-black/20 rounded p-1 text-center">
            <div className="text-xs font-bold text-white">24/7</div>
            <div className="text-[10px] text-green-200/80">Monitoring</div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  features,
  icon: Icon,
  isActive,
  onHover,
  index,
  isClickable,
  detailedInfo,
  isCompleted,
  onComplete
}) => (
  <motion.div
    whileHover={{ scale: isClickable ? 1.02 : 1 }}
    onMouseEnter={() => onHover(index)}
    onMouseLeave={() => onHover(null)}
    onClick={() => isClickable && onComplete(index)}
    className={`relative bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 transition-colors ${
      isClickable ? 'hover:bg-gray-800/70 cursor-pointer' : 'opacity-50'
    }`}
  >
    <AnimatePresence>
      {isActive && (
        <ThinkingCloud index={index}>
          {detailedInfo}
        </ThinkingCloud>
      )}
    </AnimatePresence>

    {/* Checkmark Box */}
    <div className="absolute top-4 right-4">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          borderColor: isCompleted ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)'
        }}
        className="w-6 h-6 rounded border flex items-center justify-center transition-colors"
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="text-green-400" size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>

    {/* Highlight indicator for next clickable card */}
    {isClickable && !isActive && (
      <motion.div
        className="absolute -inset-px rounded-lg"
        animate={{
          boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 2px rgba(59, 130, 246, 0.5)', '0 0 0 0 rgba(59, 130, 246, 0)']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )}

    <div className="flex items-center space-x-3 mb-3">
      <div className="p-2 bg-gray-700/50 rounded-lg">
        <Icon className="text-blue-400" size={20} />
      </div>
      <h3 className="text-sm font-medium text-gray-200">{title}</h3>
    </div>
    <p className="text-xs text-gray-400 leading-relaxed mb-3">{description}</p>
    <ul className="space-y-1">
      {features.map((feature, index) => (
        <li key={index} className="text-xs text-gray-500 flex items-center space-x-1">
          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const Features: React.FC<{ onFeatureComplete: (index: number) => void }> = ({ onFeatureComplete }) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [completedCards, setCompletedCards] = useState<number[]>([]);

  const features = [
    {
      title: 'URL:LOGIN:PASS Cloud',
      description: 'Securely store and manage your credentials in our encrypted cloud storage.',
      icon: Globe,
      features: [
        'Automatic duplicate detection',
        'Secure credential storage',
        'Advanced search capabilities',
        'Real-time statistics'
      ],
      detailedInfo: <DetailedCloudInfo />
    },
    {
      title: 'Config Cloud',
      description: 'Comprehensive config management for various tools and platforms.',
      icon: Box,
      features: [
        'OpenBullet (.anom, .loli)',
        'OpenBullet2 (.opk)',
        'SilverBullet (.svb)',
        'CookieBullet (.lce)',
        'BAS (.xml)',
        'BL Tools (.proj)'
      ]
    },
    {
      title: 'HQ & Private Targeting',
      description: 'Advanced targeting capabilities for optimal results.',
      icon: Target,
      features: [
        'High-quality target selection',
        'Private target databases',
        'Custom targeting rules',
        'Performance analytics'
      ]
    },
    {
      title: 'Daily Updates',
      description: 'Stay current with continuous updates and improvements.',
      icon: RefreshCw,
      features: [
        'Regular config updates',
        'New target additions',
        'Performance optimizations',
        'Security enhancements'
      ]
    }
  ];

  const quickLinks = [
    { icon: Cloud, label: 'Cloud Storage' },
    { icon: Database, label: 'Secure Database' },
    { icon: Settings, label: 'Advanced Tools' },
    { icon: FileText, label: 'Config Management' }
  ];

  const handleHover = (index: number | null) => {
    setActiveCard(index);
  };

  const handleComplete = (index: number) => {
    if (!completedCards.includes(index)) {
      const newCompleted = [...completedCards, index];
      setCompletedCards(newCompleted);
      onFeatureComplete(index);
      
      // Show success toast
      toast.success(`${features[index].title} completed!`, {
        icon: '✓',
        duration: 2000
      });
    }
  };

  const isCardClickable = (index: number) => {
    return index === 0 || completedCards.includes(index - 1);
  };

  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            {...feature}
            isActive={activeCard === index}
            onHover={handleHover}
            index={index}
            isClickable={isCardClickable(index)}
            detailedInfo={feature.detailedInfo}
            isCompleted={completedCards.includes(index)}
            onComplete={handleComplete}
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-6 mb-4">
          {quickLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2 text-gray-400">
              <link.icon size={16} />
              <span className="text-sm">{link.label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400">© 2025 Cloud Panel. All rights reserved.</p>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-400 transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default Features;

export { Features }