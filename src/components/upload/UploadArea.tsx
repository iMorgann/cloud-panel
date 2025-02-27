import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadAreaProps {
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: FileList) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export const UploadArea: React.FC<UploadAreaProps> = ({
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds maximum size of 10GB`);
        return false;
      }

      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        toast.error(`File ${file.name} must be a text file`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const fileListObj = new DataTransfer();
      validFiles.forEach(file => fileListObj.items.add(file));
      onFileSelect(fileListObj.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={32} />
        <p className="text-gray-300 mb-2">Drag and drop files here or</p>
        <label className="inline-block">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            multiple
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer">browse files</span>
        </label>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-400 mt-1" size={20} />
          <div>
            <h3 className="text-sm font-medium text-gray-200">Optimized for Large Files</h3>
            <p className="text-sm text-gray-400 mt-1">
              Files are processed in small chunks to maintain performance and prevent memory issues.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• Memory-efficient processing</li>
              <li>• Real-time progress tracking</li>
              <li>• Automatic duplicate handling</li>
              <li>• Supports files up to 10GB</li>
              <li>• Batch processing for better performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};