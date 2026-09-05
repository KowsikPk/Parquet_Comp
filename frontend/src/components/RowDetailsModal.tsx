import React from 'react';
import type { ComparisonResult } from '../types';

interface RowDetailsModalProps {
  result: ComparisonResult | null;
  onClose: () => void;
  fileAName?: string;
  fileBName?: string;
}

const RowDetailsModal: React.FC<RowDetailsModalProps> = ({
  result,
  onClose,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  if (!result) return null;

  const truncateFilename = (name: string, maxLength: number = 16) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const formatValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div className="fixed inset-0 bg-theme-base/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-theme-surface border border-theme-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-theme-border flex justify-between items-center bg-theme-elevated">
          <div>
            <h3 className="text-base font-extrabold text-theme-text">Row Deep Dive Inspection</h3>
            <p className="text-xs text-theme-text-secondary font-mono mt-0.5">Key: {result.row_key}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text-secondary hover:text-theme-text hover:bg-theme-muted transition-all text-xl"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File A Values */}
            <div className="bg-theme-elevated border border-theme-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>{truncateFilename(fileAName)} Record</span>
              </h4>
              {result.row_data_a ? (
                <div className="space-y-2">
                  {Object.entries(result.row_data_a).map(([col, value]) => (
                    <div key={col} className="bg-theme-base rounded-lg p-2.5 border border-theme-border">
                      <div className="text-[10px] font-mono font-bold text-theme-text-secondary uppercase">{col}</div>
                      <pre className="mt-1 text-xs text-theme-text font-mono whitespace-pre-wrap overflow-x-auto">
                        {formatValue(value)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-theme-text-muted italic">No record found in File A</div>
              )}
            </div>

            {/* File B Values */}
            <div className="bg-theme-elevated border border-theme-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>{truncateFilename(fileBName)} Record</span>
              </h4>
              {result.row_data_b ? (
                <div className="space-y-2">
                  {Object.entries(result.row_data_b).map(([col, value]) => (
                    <div key={col} className="bg-theme-base rounded-lg p-2.5 border border-theme-border">
                      <div className="text-[10px] font-mono font-bold text-theme-text-secondary uppercase">{col}</div>
                      <pre className="mt-1 text-xs text-theme-text font-mono whitespace-pre-wrap overflow-x-auto">
                        {formatValue(value)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-theme-text-muted italic">No record found in File B</div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-theme-border bg-theme-elevated flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-theme-base hover:bg-theme-muted text-theme-text-secondary border border-theme-border rounded-xl text-xs font-semibold transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default RowDetailsModal;