import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, Cloud, Database, Lock } from 'lucide-react';
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

export const Onboarding: React.FC<{ onOpenFooter: () => void }> = ({ onOpenFooter }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasOpenedFooter, setHasOpenedFooter] = useState(false);
  const [showPullAnimation, setShowPullAnimation] = useState(false);
  const [shouldEndOnboarding, setShouldEndOnboarding] = useState(false);

  const steps: Step[] = [
    {
      title: "Welcome to Cloud Panel",
      description: "Let's take a quick tour of the platform. Click 'Next' to continue.",
      Icon: Cloud,
      color: "text-blue-400"
    },
    {
      title: "Explore Features",
      description: "Pull up the footer to reveal more features.",
      Icon: ChevronDown,
      color: "text-green-400",
      action: "openFooter"
    },
    {
      title: "Secure Storage",
      description: "Your data is protected with enterprise-grade encryption.",
      Icon: Lock,
      color: "text-purple-400"
    },
    {
      title: "Get Started",
      description: "Create an account to start managing your credentials securely.",
      Icon: Shield,
      color: "text-yellow-400"
    }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !hasOpenedFooter) {
      toast.error("Please open the footer first!");
      onOpenFooter();
      setShowPullAnimation(true);
      return;
    }
    setCurrentStep((prev) => (prev + 1) % steps.length);
    setShowPullAnimation(false);
  };

  const handleFooterOpen = () => {
    setHasOpenedFooter(true);
    setShowPullAnimation(false);
  };

  // Listen for cloud click event
  useEffect(() => {
    const handleCloudClick = () => {
      setShouldEndOnboarding(true);
      setIsVisible(false);
    };

    window.addEventListener('footerCloudClicked', handleCloudClick);
    return () => window.removeEventListener('footerCloudClicked', handleCloudClick);
  }, []);

  useEffect(() => {
    if (currentStep === 1) {
      setShowPullAnimation(true);
    } else {
      setShowPullAnimation(false);
    }
  }, [currentStep]);

  useEffect(() => {
    window.addEventListener('footerOpened', handleFooterOpen);
    return () => window.removeEventListener('footerOpened', handleFooterOpen);
  }, [currentStep]);

  if (!isVisible || shouldEndOnboarding) return null;

  return (
    <>
      {/* Translucent Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: currentStep !== 1 ? 1 : 0.3 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Cloud Welcome Animation for Step 1 */}
      <AnimatePresence>
        {currentStep === 0 && <CloudWelcome />}
      </AnimatePresence>

      {/* Floating Step for "Explore Features" */}
      <AnimatePresence>
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center"
            >
              <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">
                {steps[currentStep].title}
              </h3>
              <p className="text-lg text-white/90 max-w-md drop-shadow-lg">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull Up Animation */}
      <AnimatePresence>
        {showPullAnimation && !hasOpenedFooter && <PullUpAnimation />}
      </AnimatePresence>

      {/* Regular Onboarding Dialog (hidden during steps 1 and 2) */}
      {currentStep > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl p-8 w-full max-w-2xl z-50 shadow-2xl border border-gray-700/50"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            ×
          </motion.button>

          <div className="relative h-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className={`p-6 rounded-2xl bg-gray-700/50 ${steps[currentStep].color}`}>
                      {React.createElement(steps[currentStep].Icon, { size: 48 })}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{steps[currentStep].title}</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto">
                    {steps[currentStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentStep === index ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVisible(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Skip
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};