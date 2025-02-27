import React from 'react';

interface FilePreviewProps {
  content: string[];
}

export const FilePreview: React.FC<FilePreviewProps> = ({ content }) => {
  const previewLines = content.slice(0, 5);
  const remainingLines = content.length - 5;

  return (
    <div className="bg-gray-800/50 rounded p-2 text-sm font-mono">
      {previewLines.map((line, i) => (
        <div key={i} className="text-gray-300">{line}</div>
      ))}
      {remainingLines > 0 && (
        <div className="text-gray-400">... and {remainingLines} more lines</div>
      )}
    </div>
  );
};