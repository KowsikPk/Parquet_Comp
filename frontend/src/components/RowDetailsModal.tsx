import React from 'react';
import type { ComparisonResult } from '../types';

interface RowDetailsModalProps {
  result: ComparisonResult | null;
  onClose: () => void;
  fileAName?: string;
  fileBName?: string;
}

const RowDetailsModal: React.FC<RowDetailsModalProps> = ({ result, onClose, fileAName = 'File A', fileBName = 'File B' }) => {
  if (!result) return null;

  // Truncate filename for display
  const truncateFilename = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    const baseName = name.replace(ext, '');
    return baseName.substring(0, maxLength - ext.length - 3) + '...' + ext;
  };

  const formatValue = (value: string) => {
    try {
      // Try to parse as JSON for better formatting
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If JSON parsing fails, try to parse as tuple representation
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          // Convert tuple representation to JSON
          const cleanValue = value.replace(/'/g, '"');
          const parsed = JSON.parse(cleanValue);
          if (Array.isArray(parsed) && parsed.every(item => Array.isArray(item) && item.length === 2)) {
            // Convert array of tuples to object
            const obj = Object.fromEntries(parsed);
            return JSON.stringify(obj, null, 2);
          }
          return JSON.stringify(parsed, null, 2);
        } catch {
          return value;
        }
      }
      return value;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Row Details - {result.row_key}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-2 gap-6">
            {/* File A Values */}
            <div>
              <h4 className="text-lg font-medium text-blue-600 mb-4 flex items-center" title={fileAName}>
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                {truncateFilename(fileAName, 25)} Values
              </h4>
              {result.row_data_a ? (
                <div className="space-y-3">
                  {Object.entries(result.row_data_a).map(([col, value]) => (
                    <div key={col} className="border rounded-lg overflow-hidden">
                      <div className="bg-blue-50 px-3 py-2 font-medium text-sm text-blue-800">
                        {col}
                      </div>
                      <pre className="p-3 text-xs overflow-x-auto font-mono bg-white">
                        {formatValue(value)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No data available</div>
              )}
            </div>

            {/* File B Values */}
            <div>
              <h4 className="text-lg font-medium text-green-600 mb-4 flex items-center" title={fileBName}>
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                {truncateFilename(fileBName, 25)} Values
              </h4>
              {result.row_data_b ? (
                <div className="space-y-3">
                  {Object.entries(result.row_data_b).map(([col, value]) => (
                    <div key={col} className="border rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-3 py-2 font-medium text-sm text-green-800">
                        {col}
                      </div>
                      <pre className="p-3 text-xs overflow-x-auto font-mono bg-white">
                        {formatValue(value)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>

          {/* Differences Section */}
          {result.differences.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-medium text-red-600 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Differences
              </h4>
              <div className="space-y-4">
                {result.differences.map((diff, idx) => (
                  <div key={idx} className="border-2 border-red-200 rounded-lg overflow-hidden">
                    <div className="bg-red-50 px-4 py-3 font-medium text-red-800">
                      Column: {diff.column}
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div>
                        <div className="text-sm font-medium text-red-600 mb-2" title={fileAName}>{truncateFilename(fileAName, 20)}:</div>
                        <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto font-mono border border-red-200">
                          {formatValue(diff.value_a)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-600 mb-2" title={fileBName}>{truncateFilename(fileBName, 20)}:</div>
                        <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto font-mono border border-red-200">
                          {formatValue(diff.value_b)}
                        </pre>
                      </div>
                    </div>
                    {diff.diff_keys.length > 0 && (
                      <div className="px-4 pb-4">
                        <div className="text-sm font-medium text-red-600 mb-2">Different Keys:</div>
                        <div className="flex flex-wrap gap-2">
                          {diff.diff_keys.map((key, keyIdx) => (
                            <span key={keyIdx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {key}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RowDetailsModal;