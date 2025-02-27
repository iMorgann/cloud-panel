import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp: boolean;
  onToggleMode: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  isLoading: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isSignUp,
  onToggleMode,
  onSubmit,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-800/90 backdrop-blur rounded-2xl p-6 w-full max-w-md border border-gray-700"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          {isSignUp ? (
            <SignUpForm
              onSubmit={onSubmit}
              email={email}
              onEmailChange={onEmailChange}
              password={password}
              onPasswordChange={onPasswordChange}
              isLoading={isLoading}
              onToggleMode={onToggleMode}
            />
          ) : (
            <LoginForm
              onSubmit={onSubmit}
              email={email}
              onEmailChange={onEmailChange}
              password={password}
              onPasswordChange={onPasswordChange}
              isLoading={isLoading}
              onToggleMode={onToggleMode}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};