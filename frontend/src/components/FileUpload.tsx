import React, { useState, useCallback } from 'react';

// UI IMPROVEMENT: Translation-ready constants
const t = (key: string): string => key;

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
  metadata?: {
    row_count: number;
    columns: number;
    file_size: number;
  };
  onRemove?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  selectedFile,
  disabled = false,
  metadata,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.parquet')) {
        setError(null);
        onFileSelect(file);
      } else {
        setError(t('upload.error_parquet_only'));
      }
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.parquet')) {
        setError(null);
        onFileSelect(file);
      } else {
        setError(t('upload.error_parquet_only'));
      }
    }
  }, [disabled, onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const truncateFilename = (name: string, maxLength: number = 28): string => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // Display label: show filename after selection, otherwise show default label
  const displayLabel = selectedFile ? truncateFilename(selectedFile.name, 35) : label;

  return (
    <div className="w-[48%]">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" title={selectedFile?.name}>
        {displayLabel}
      </label>
      <div
        className={`relative min-h-[200px] border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
          isDragging
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : selectedFile
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          isDragging ? 'animate-pulse-border' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* UI IMPROVEMENT #1: Remove button with X icon */}
        {selectedFile && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 left-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label={t('upload.remove_file')}
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        {/* UI IMPROVEMENT #1: Success checkmark */}
        {selectedFile && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        )}

        <input
          type="file"
          accept=".parquet"
          onChange={handleFileInput}
          className="hidden"
          id={`file-input-${label}`}
          disabled={disabled}
        />
        <label
          htmlFor={`file-input-${label}`}
          className={`cursor-pointer h-full flex flex-col items-center justify-center ${disabled ? 'pointer-events-none' : ''}`}
        >
          {selectedFile ? (
            <div className="w-full">
              {/* UI IMPROVEMENT #1: File chip with DATABASE icon */}
              <div className="flex items-center justify-center mb-3">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400 mr-2" style={{fontSize: '1.5rem'}}>
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
                <div className="text-green-600 dark:text-green-400 font-bold text-lg" style={{fontSize: '1.125rem'}}>
                  {truncateFilename(selectedFile.name, 200)}
                </div>
              </div>
              
              {/* UI IMPROVEMENT #2: File metadata row with DATABASE icon */}
              {metadata && (
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-4" style={{fontSize: '0.8rem'}}>
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                  {metadata.row_count} rows · {metadata.columns} columns · {formatFileSize(metadata.file_size)}
                </div>
              )}
              
              {/* Metadata mini-grid */}
              {metadata && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-white dark:bg-[#0F1117] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1" style={{fontSize: '0.75rem'}}>Rows</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '0.875rem'}}>{metadata.row_count}</div>
                  </div>
                  <div className="bg-white dark:bg-[#0F1117] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1" style={{fontSize: '0.75rem'}}>Columns</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '0.875rem'}}>{metadata.columns}</div>
                  </div>
                  <div className="bg-white dark:bg-[#0F1117] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1" style={{fontSize: '0.75rem'}}>Size</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]" style={{fontSize: '0.875rem'}}>{formatFileSize(metadata.file_size)}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* UI IMPROVEMENT #1: UPLOAD icon for empty state */}
              <div className={`mb-4 ${isDragging ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} style={{fontSize: '2.5rem'}}>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              
              <div className="text-gray-500 dark:text-gray-400 font-medium mb-1" style={{fontSize: '0.875rem'}}>
                {isDragging ? 'Release to upload' : `Drop ${label} here`}
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500" style={{fontSize: '0.8rem'}}>
                Click to browse
              </div>
            </div>
          )}
        </label>
      </div>
      
      {/* UI IMPROVEMENT #1: Error state with WARNING TRIANGLE icon */}
      {error && (
        <div className="mt-2 flex items-center text-red-500" style={{fontSize: '0.875rem'}}>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
