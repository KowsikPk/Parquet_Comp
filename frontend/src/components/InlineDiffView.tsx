import React from 'react';
import type { ComparisonResult } from '../types';

interface InlineDiffViewProps {
  result: ComparisonResult;
  fileAName?: string;
  fileBName?: string;
  displayColumns?: string[];
}

const InlineDiffView: React.FC<InlineDiffViewProps> = ({
  result,
  fileAName = 'File A',
  fileBName = 'File B',
  displayColumns = []
}) => {
  const getDiffKeys = (propsA: any, propsB: any) => {
    if (!propsA || !propsB) return [];
    const keysA = Object.keys(propsA);
    return keysA.filter(k => JSON.stringify(propsA[k]) !== JSON.stringify(propsB[k]));
  };

  const parseProperties = (value: any) => {
    if (!value) return null;
    
    // If it's already an object/array, format it
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return null;
      }
    }
    
    // Handle Parquet MAP types which become arrays of [key, value] tuples
    if (Array.isArray(parsed)) {
      const obj: Record<string, any> = {};
      parsed.forEach(item => {
        if (Array.isArray(item) && item.length >= 2) {
          obj[item[0]] = item[1];
        } else if (typeof item === 'object' && item !== null && 'key' in item && 'value' in item) {
          obj[item.key] = item.value;
        }
      });
      return Object.keys(obj).length > 0 ? obj : parsed;
    }
    
    return parsed;
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const getDisplayColumnData = (rowData: any) => {
    if (!rowData) return [];
    return displayColumns.map(col => ({
      key: col,
      value: rowData[col]
    })).filter(item => item.value !== undefined);
  };

  const getPropertiesData = (rowData: any) => {
    if (!rowData || !rowData['properties']) return null;
    return parseProperties(rowData['properties']);
  };

  const propsA = getPropertiesData(result.row_data_a);
  const propsB = getPropertiesData(result.row_data_b);
  const diffKeys = getDiffKeys(propsA, propsB);

  const displayDataA = getDisplayColumnData(result.row_data_a);
  const displayDataB = getDisplayColumnData(result.row_data_b);

  const renderProperties = (props: any, diffKeys: string[], isFileA: boolean) => {
    if (!props) return <div className="text-theme-text-muted italic text-xs">No properties</div>;

    return (
      <div className="font-mono text-xs leading-relaxed max-h-72 overflow-y-auto pr-1 space-y-1">
        <div className="text-theme-text-muted">properties: {'{'}</div>
        {Object.entries(props).map(([key, value]) => {
          const isDiff = diffKeys.includes(key);
          return (
            <div
              key={key}
              className={`pl-4 py-0.5 rounded flex items-center justify-between ${
                isDiff
                  ? isFileA
                    ? 'bg-amber-500/10 text-amber-300 font-bold border-l-2 border-amber-500'
                    : 'bg-sky-500/10 text-sky-300 font-bold border-l-2 border-sky-500'
                  : 'text-theme-text-secondary'
              }`}
            >
              <div className="truncate">
                <span className="text-theme-text-secondary">{key}: </span>
                <span className={isDiff ? (isFileA ? 'text-amber-200' : 'text-sky-200') : 'text-emerald-400'}>
                  "{formatValue(value)}"
                </span>
              </div>
              {isDiff && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  DIFF
                </span>
              )}
            </div>
          );
        })}
        <div className="text-theme-text-muted">{'}'}</div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface overflow-hidden my-2">
      {/* Side by side comparison container */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-theme-border">
        {/* File A Side */}
        <div className="p-4 space-y-3 bg-theme-elevated/40">
          <div className="flex items-center space-x-2 pb-2 border-b border-theme-border">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-bold text-blue-400 font-mono truncate">{fileAName}</span>
          </div>

          {displayDataA.length > 0 && (
            <div className="space-y-1 pb-2 border-b border-theme-border">
              {displayDataA.map(({ key, value }) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-theme-text-secondary font-mono">{key}:</span>
                  <span className="text-theme-text font-mono">{formatValue(value)}</span>
                </div>
              ))}
            </div>
          )}

          {renderProperties(propsA, diffKeys, true)}
        </div>

        {/* File B Side */}
        <div className="p-4 space-y-3 bg-theme-elevated/40">
          <div className="flex items-center space-x-2 pb-2 border-b border-theme-border">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-xs font-bold text-sky-400 font-mono truncate">{fileBName}</span>
          </div>

          {displayDataB.length > 0 && (
            <div className="space-y-1 pb-2 border-b border-theme-border">
              {displayDataB.map(({ key, value }) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-theme-text-secondary font-mono">{key}:</span>
                  <span className="text-theme-text font-mono">{formatValue(value)}</span>
                </div>
              ))}
            </div>
          )}

          {renderProperties(propsB, diffKeys, false)}
        </div>
      </div>

      {/* Footer info bar */}
      <div className="px-4 py-2 bg-theme-elevated border-t border-theme-border flex items-center justify-between text-xs">
        {result.status === 'match' ? (
          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Identical attributes detected across evaluated schema</span>
          </span>
        ) : (
          <span className="text-amber-400 font-semibold flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{diffKeys.length} attribute mismatch(es) detected in row</span>
          </span>
        )}
        <span className="text-[10px] text-theme-text-muted font-mono">Row Key: {result.row_key}</span>
      </div>
    </div>
  );
};

export default InlineDiffView;
