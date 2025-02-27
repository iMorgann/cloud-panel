import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  icon: Icon, 
  iconColor = 'text-blue-400',
  children,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-700/50 p-6 rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={iconColor} size={24} />
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
};