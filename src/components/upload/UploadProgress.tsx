import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronUp, ChevronDown, FileText, AlertCircle, Info } from 'lucide-react';
import { FilePreview } from './FilePreview';

interface UploadProgressItem {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  content?: string[];
  showPreview?: boolean;
  stats?: {
    processedChunks: number;
    totalChunks: number;
    uniqueLines: number;
    duplicates: number;
    fileSize: number;
    validLines: number;
    invalidLines: number;
  };
}

interface UploadProgressProps {
  items: UploadProgressItem[];
  onTogglePreview: (fileName: string) => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  items,
  onTogglePreview
}) => {
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 mb-6"
      >
        {items.map((item) => (
          <motion.div
            key={item.fileName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-gray-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-800/50 rounded-lg">
                  <FileText className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">{item.fileName}</h3>
                  {item.stats && (
                    <p className="text-sm text-gray-400 mt-1">
                      {formatFileSize(item.stats.fileSize)} • Processing lines...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.content && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onTogglePreview(item.fileName)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.showPreview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </motion.button>
                )}
                {item.status === 'completed' && <CheckCircle size={20} className="text-green-500" />}
                {item.status === 'error' && <XCircle size={20} className="text-red-500" />}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${item.progress}%`,
                  backgroundColor: item.status === 'error' 
                    ? '#EF4444' 
                    : item.status === 'completed'
                      ? '#10B981'
                      : '#3B82F6'
                }}
                className="absolute h-full transition-all duration-300"
              />
            </div>

            {/* Progress Percentage */}
            <div className="mt-2 text-sm text-gray-400">
              {item.status === 'processing' && (
                <span>{Math.round(item.progress)}% complete</span>
              )}
              {item.status === 'completed' && (
                <span className="text-green-400">Processing completed</span>
              )}
              {item.status === 'error' && (
                <span className="text-red-400">Processing failed</span>
              )}
            </div>

            {/* Processing Stats */}
            {item.stats && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-400">Unique Lines</p>
                    <CheckCircle className="text-green-400" size={14} />
                  </div>
                  <p className="text-lg font-medium text-green-400">
                    {item.stats.uniqueLines.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-400">Duplicates</p>
                    <Info className="text-yellow-400" size={14} />
                  </div>
                  <p className="text-lg font-medium text-yellow-400">
                    {item.stats.duplicates.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-400">Valid Lines</p>
                    <Info className="text-blue-400" size={14} />
                  </div>
                  <p className="text-lg font-medium text-blue-400">
                    {item.stats.validLines.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">URL:LOGIN:PASS format</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-400">Invalid Lines</p>
                    <AlertCircle className="text-red-400" size={14} />
                  </div>
                  <p className="text-lg font-medium text-red-400">
                    {item.stats.invalidLines.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">skipped</p>
                </div>
              </div>
            )}

            {/* File Preview */}
            <AnimatePresence>
              {item.showPreview && item.content && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <FilePreview content={item.content} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {item.status === 'error' && (
              <div className="mt-3 flex items-start space-x-2 text-red-400 bg-red-400/10 rounded-lg p-3">
                <AlertCircle size={16} className="mt-0.5" />
                <p className="text-sm">An error occurred while processing the file. Please try again.</p>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};