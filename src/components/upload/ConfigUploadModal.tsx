import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ConfigUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileExtension: string;
  folderName: string;
  onUploadComplete: () => void;
}

export const ConfigUploadModal: React.FC<ConfigUploadModalProps> = ({
  isOpen,
  onClose,
  fileExtension,
  folderName,
  onUploadComplete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = fileExtension.split('/').map(ext => ext.trim());

  const validateFileExtension = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    return allowedExtensions.includes(`.${extension}`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileSelect = (file: File) => {
    if (!validateFileExtension(file.name)) {
      toast.error(`Invalid file type. Please upload a ${fileExtension} file.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const content = await selectedFile.text();
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('configs')
        .insert({
          name: selectedFile.name,
          type: folderName.toLowerCase(),
          content: content,
          user_id: userData.user.id,
          status: 'pending',
          downloads: 0,
          rating: 0
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Config uploaded successfully!');
      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload config');
    } finally {
      setUploading(false);
    }
  };

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
          className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative border border-gray-700"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-semibold text-gray-200 mb-4">
            Upload {folderName} Config
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <FileUp className="mx-auto mb-4 text-gray-400" size={32} />
            <p className="text-gray-300 mb-2">
              Drag and drop your {fileExtension} file here or
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedExtensions.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              browse files
            </button>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-gray-700/50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <FileUp size={18} className="text-blue-400" />
                <span className="text-sm text-gray-300">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <AlertCircle size={16} />
              <span>Allowed: {fileExtension}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload size={18} />
                  </motion.div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Upload Config</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};