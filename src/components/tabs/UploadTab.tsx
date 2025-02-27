import React from 'react';
import { UploadProgress } from '../upload/UploadProgress';
import { UploadArea } from '../upload/UploadArea';

interface UploadTabProps {
  uploadProgress: any[];
  onTogglePreview: (fileName: string) => void;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: FileList) => void;
  onManualUpload: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  uploadProgress,
  onTogglePreview,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  onManualUpload
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Upload Entries</h2>
      
      <UploadProgress
        items={uploadProgress}
        onTogglePreview={onTogglePreview}
      />

      <UploadArea
        dragActive={dragActive}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onFileSelect={onFileSelect}
      />

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Manual Input</h3>
        <textarea
          placeholder="Enter data manually (one entry per line)"
          onChange={onManualUpload}
          className="w-full h-32 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};