import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserPlus, CreditCard, X, Key } from 'lucide-react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PaymentOverlay } from './PaymentOverlay';

interface SignUpFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  isLoading: boolean;
  onToggleMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  isLoading,
  onToggleMode
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [accessKey, setAccessKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      toast.error('Access Key is required');
      return;
    }
    onSubmit(e);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Password must be at least 6 characters long
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Access Key
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your access key"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Required for account creation. Purchase below if you don't have one.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size={20} color="text-white" />
          ) : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </motion.button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">or</span>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setShowPayment(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-2 rounded-lg transition-colors text-white"
        >
          <CreditCard size={18} />
          <span>Purchase Access Key</span>
        </motion.button>

        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>

      <AnimatePresence>
        {showPayment && (
          <PaymentOverlay onClose={() => setShowPayment(false)} />
        )}
      </AnimatePresence>
    </>
  );
};