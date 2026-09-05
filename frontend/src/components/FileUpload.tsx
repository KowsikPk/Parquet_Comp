import React, { useState, useCallback } from 'react';

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
  accentColor?: 'indigo' | 'violet';
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  selectedFile,
  disabled = false,
  metadata,
  onRemove,
  accentColor = 'indigo'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIndigo = accentColor === 'indigo';
  const borderHighlight = isIndigo ? 'hover:border-blue-500/50' : 'hover:border-sky-500/50';
  const dragActiveBorder = isIndigo ? 'border-blue-500 bg-blue-500/10' : 'border-sky-500 bg-sky-500/10';
  const badgeGradient = isIndigo ? 'from-blue-600 to-blue-700' : 'from-sky-600 to-sky-700';

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
        setError(t('Please select a valid .parquet file'));
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
        setError(t('Please select a valid .parquet file'));
      }
    }
  }, [disabled, onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  };

  const truncateFilename = (name: string, maxLength: number = 30): string => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  return (
    <div className="w-full flex-1">
      {/* Top Header & Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${badgeGradient} text-white shadow-sm`}>
            {label}
          </span>
          {selectedFile && (
            <span className="text-xs text-theme-text-secondary font-mono truncate max-w-[200px]" title={selectedFile.name}>
              {selectedFile.name}
            </span>
          )}
        </div>
        {selectedFile && (
          <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Ready</span>
          </span>
        )}
      </div>

      {/* Upload Zone Card */}
      <div
        className={`relative min-h-[220px] rounded-2xl p-6 transition-all duration-300 border-2 border-dashed flex flex-col items-center justify-center text-center ${
          isDragging
            ? `${dragActiveBorder} scale-[1.01] shadow-xl`
            : selectedFile
            ? 'bg-theme-surface border-slate-700/60 shadow-lg'
            : `bg-theme-surface/70 border-theme-border ${borderHighlight} hover:bg-theme-surface`
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Remove Button */}
        {selectedFile && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 right-3 p-1.5 bg-theme-elevated hover:bg-red-500/20 text-theme-text-secondary hover:text-red-400 rounded-lg border border-theme-border transition-all"
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <input
          type="file"
          accept=".parquet"
          onChange={handleFileInput}
          className="hidden"
          id={`file-input-${label.replace(/\s+/g, '-')}`}
          disabled={disabled}
        />

        <label
          htmlFor={`file-input-${label.replace(/\s+/g, '-')}`}
          className={`w-full h-full cursor-pointer flex flex-col items-center justify-center ${disabled ? 'pointer-events-none' : ''}`}
        >
          {selectedFile ? (
            <div className="w-full space-y-4">
              {/* File Icon & Name */}
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isIndigo ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-theme-text text-sm tracking-tight" title={selectedFile.name}>
                    {truncateFilename(selectedFile.name, 28)}
                  </div>
                  <div className="text-xs text-theme-text-secondary font-mono">.parquet dataset</div>
                </div>
              </div>

              {/* Metadata Mini-Grid */}
              {metadata && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-theme-border">
                  <div className="bg-theme-elevated p-2.5 rounded-xl border border-theme-border text-center">
                    <span className="block text-[10px] font-semibold text-theme-text-secondary uppercase">Rows</span>
                    <span className="text-xs font-bold text-theme-text font-mono">{metadata.row_count.toLocaleString()}</span>
                  </div>
                  <div className="bg-theme-elevated p-2.5 rounded-xl border border-theme-border text-center">
                    <span className="block text-[10px] font-semibold text-theme-text-secondary uppercase">Columns</span>
                    <span className="text-xs font-bold text-theme-text font-mono">{metadata.columns}</span>
                  </div>
                  <div className="bg-theme-elevated p-2.5 rounded-xl border border-theme-border text-center">
                    <span className="block text-[10px] font-semibold text-theme-text-secondary uppercase">Size</span>
                    <span className="text-xs font-bold text-theme-text font-mono">{formatFileSize(metadata.file_size)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                isIndigo ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
              }`}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-theme-text">
                  {isDragging ? `Drop ${label} here` : `Drag & drop ${label}`}
                </p>
                <p className="text-xs text-theme-text-secondary mt-1">or click to browse from disk</p>
              </div>

              <div className="inline-block px-3 py-1 bg-theme-elevated text-theme-text-secondary text-[11px] font-mono rounded-lg border border-theme-border">
                Supports .parquet format
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center space-x-1 font-medium bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
