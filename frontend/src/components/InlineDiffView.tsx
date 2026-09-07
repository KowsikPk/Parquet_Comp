import React, { useState } from 'react';
import type { ComparisonResult } from '../types';

interface InlineDiffViewProps {
  result: ComparisonResult;
  fileAName?: string;
  fileBName?: string;
}

type DiffType = 'added' | 'removed' | 'modified' | 'identical';

interface DiffItem {
  key: string;
  type: DiffType;
  valA?: any;
  valB?: any;
}

const InlineDiffView: React.FC<InlineDiffViewProps> = ({
  result,
  fileAName = 'File A',
  fileBName = 'File B'
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [onlyDiffs, setOnlyDiffs] = useState<boolean>(false);

  const parseProperties = (value: any) => {
    if (!value) return null;
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
    if (value === undefined || value === null) return 'null';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const getDisplayColumnData = (rowData: any): Record<string, any> => {
    if (!rowData) return {};
    const data: Record<string, any> = {};
    Object.keys(rowData)
      .filter(col => col !== 'properties')
      .forEach(col => {
        if (rowData[col] !== undefined) {
          data[col] = rowData[col];
        }
      });
    return data;
  };

  const getPropertiesData = (rowData: any) => {
    if (!rowData || !rowData['properties']) return null;
    return parseProperties(rowData['properties']);
  };

  const propsA = getPropertiesData(result.row_data_a);
  const propsB = getPropertiesData(result.row_data_b);

  const displayColsA = getDisplayColumnData(result.row_data_a);
  const displayColsB = getDisplayColumnData(result.row_data_b);

  // Robust diff calculation across ALL keys from both File A and File B
  const calculateDiffs = (objA: any, objB: any): DiffItem[] => {
    if (!objA && !objB) return [];
    const keysA = objA && typeof objA === 'object' ? Object.keys(objA) : [];
    const keysB = objB && typeof objB === 'object' ? Object.keys(objB) : [];
    const allKeys = Array.from(new Set([...keysA, ...keysB]));

    return allKeys.map(key => {
      const hasA = objA !== null && objA !== undefined && key in objA;
      const hasB = objB !== null && objB !== undefined && key in objB;

      if (hasA && !hasB) {
        return { key, type: 'removed', valA: objA[key] };
      }
      if (!hasA && hasB) {
        return { key, type: 'added', valB: objB[key] };
      }
      if (JSON.stringify(objA[key]) !== JSON.stringify(objB[key])) {
        return { key, type: 'modified', valA: objA[key], valB: objB[key] };
      }
      return { key, type: 'identical', valA: objA[key], valB: objB[key] };
    });
  };

  const propDiffs = calculateDiffs(propsA, propsB);
  const colDiffs = calculateDiffs(displayColsA, displayColsB);

  const propMismatches = propDiffs.filter(d => d.type !== 'identical');
  const colMismatches = colDiffs.filter(d => d.type !== 'identical');
  const totalMismatches = propMismatches.length + colMismatches.length;

  const filteredPropDiffs = onlyDiffs ? propDiffs.filter(d => d.type !== 'identical') : propDiffs;

  const addedCount = propMismatches.filter(d => d.type === 'added').length + colMismatches.filter(d => d.type === 'added').length;
  const removedCount = propMismatches.filter(d => d.type === 'removed').length + colMismatches.filter(d => d.type === 'removed').length;
  const modifiedCount = propMismatches.filter(d => d.type === 'modified').length + colMismatches.filter(d => d.type === 'modified').length;

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface overflow-hidden my-2 shadow-lg">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-theme-elevated border-b border-theme-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-theme-text flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Comparison View</span>
          </span>

          {totalMismatches > 0 ? (
            <div className="flex items-center space-x-1 text-[11px] font-mono">
              {addedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  +{addedCount} added
                </span>
              )}
              {removedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30">
                  -{removedCount} removed
                </span>
              )}
              {modifiedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  ~{modifiedCount} changed
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              100% Identical
            </span>
          )}
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center space-x-2">
          {totalMismatches > 0 && (
            <button
              type="button"
              onClick={() => setOnlyDiffs(!onlyDiffs)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
                onlyDiffs
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm'
                  : 'bg-theme-base text-theme-text-secondary hover:text-theme-text border-theme-border'
              }`}
            >
              {onlyDiffs ? 'Showing Only Diffs' : 'Filter to Diffs'}
            </button>
          )}

          <div className="flex items-center rounded-lg bg-theme-base p-0.5 border border-theme-border text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-theme-text-secondary hover:text-theme-text'
              }`}
            >
              Split (Side-by-Side)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'unified'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-theme-text-secondary hover:text-theme-text'
              }`}
            >
              Unified (GitHub Diff)
            </button>
          </div>
        </div>
      </div>

      {/* Difference summary pills if changes exist */}
      {totalMismatches > 0 && (
        <div className="px-4 py-2 bg-theme-elevated/40 border-b border-theme-border text-xs flex flex-wrap gap-1.5 items-center">
          <span className="text-theme-text-secondary text-[11px] font-semibold">Changes:</span>
          {colMismatches.map(diff => (
            <span key={diff.key} className="px-2 py-0.5 rounded text-[11px] font-mono bg-theme-base border border-theme-border">
              {diff.type === 'added' && <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ {diff.key}</span>}
              {diff.type === 'removed' && <span className="text-red-600 dark:text-red-400 font-bold">- {diff.key}</span>}
              {diff.type === 'modified' && <span className="text-amber-600 dark:text-amber-400 font-bold">~ {diff.key}</span>}
            </span>
          ))}
          {propMismatches.map(diff => (
            <span key={diff.key} className="px-2 py-0.5 rounded text-[11px] font-mono bg-theme-base border border-theme-border">
              {diff.type === 'added' && <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ {diff.key}</span>}
              {diff.type === 'removed' && <span className="text-red-600 dark:text-red-400 font-bold">- {diff.key}</span>}
              {diff.type === 'modified' && <span className="text-amber-600 dark:text-amber-400 font-bold">~ {diff.key}</span>}
            </span>
          ))}
        </div>
      )}

      {/* VIEW MODE 1: SPLIT (SIDE-BY-SIDE) WITH ACCURATE GITHUB HIGHLIGHTING */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-theme-border">
          {/* File A Side (Left) */}
          <div className="p-4 space-y-3 bg-theme-elevated/20">
            <div className="flex items-center justify-between pb-2 border-b border-theme-border">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono truncate">{fileAName}</span>
              </div>
              <span className="text-[10px] text-theme-text-muted font-mono uppercase">Original</span>
            </div>

            {/* Display Columns (e.g. ObjectClass) */}
            {colDiffs.length > 0 && (
              <div className="space-y-1 pb-2 border-b border-theme-border">
                {colDiffs.map(({ key, type, valA }) => {
                  const isDiff = type !== 'identical';
                  return (
                    <div
                      key={key}
                      className={`text-xs flex justify-between px-2 py-1 rounded font-mono ${
                        isDiff
                          ? type === 'removed'
                            ? 'bg-red-500/15 text-red-700 dark:text-red-300 font-bold border-l-2 border-red-500'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border-l-2 border-amber-500'
                          : 'text-theme-text-secondary'
                      }`}
                    >
                      <span className="font-semibold">{key}:</span>
                      <span>{valA !== undefined ? formatValue(valA) : <span className="italic opacity-50">— (missing)</span>}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Properties Block */}
            <div className="font-mono text-xs leading-relaxed max-h-80 overflow-y-auto pr-1 space-y-0.5">
              <div className="text-theme-text-muted font-semibold">properties: {'{'}</div>
              {filteredPropDiffs.map(({ key, type, valA }) => {
                if (type === 'added') {
                  // Key is ONLY in File B -> File A shows empty placeholder line to keep alignment
                  return (
                    <div
                      key={key}
                      className="pl-4 py-0.5 rounded flex items-center justify-between bg-emerald-500/5 text-theme-text-muted italic border-l-2 border-transparent"
                    >
                      <span className="opacity-40">{key}: — (not in File A)</span>
                    </div>
                  );
                }

                const isRemoved = type === 'removed';
                const isModified = type === 'modified';
                const isDiff = isRemoved || isModified;

                return (
                  <div
                    key={key}
                    className={`pl-4 py-0.5 rounded flex items-center justify-between transition-colors ${
                      isRemoved
                        ? 'bg-red-500/15 text-red-700 dark:text-red-300 font-semibold border-l-2 border-red-500'
                        : isModified
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border-l-2 border-amber-500'
                        : 'text-theme-text-secondary hover:bg-theme-elevated/50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className={isDiff ? 'font-bold' : 'text-theme-text-secondary'}>{key}: </span>
                      <span className={isDiff ? 'text-red-700 dark:text-red-200 font-mono' : 'text-theme-text'}>
                        "{formatValue(valA)}"
                      </span>
                    </div>
                    {isRemoved && (
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 shrink-0">
                        - REMOVED
                      </span>
                    )}
                    {isModified && (
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shrink-0">
                        MODIFIED
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="text-theme-text-muted font-semibold">{'}'}</div>
            </div>
          </div>

          {/* File B Side (Right) */}
          <div className="p-4 space-y-3 bg-theme-elevated/20">
            <div className="flex items-center justify-between pb-2 border-b border-theme-border">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono truncate">{fileBName}</span>
              </div>
              <span className="text-[10px] text-theme-text-muted font-mono uppercase">Target</span>
            </div>

            {/* Display Columns (e.g. ObjectClass) */}
            {colDiffs.length > 0 && (
              <div className="space-y-1 pb-2 border-b border-theme-border">
                {colDiffs.map(({ key, type, valB }) => {
                  const isDiff = type !== 'identical';
                  return (
                    <div
                      key={key}
                      className={`text-xs flex justify-between px-2 py-1 rounded font-mono ${
                        isDiff
                          ? type === 'added'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border-l-2 border-emerald-500'
                            : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold border-l-2 border-sky-500'
                          : 'text-theme-text-secondary'
                      }`}
                    >
                      <span className="font-semibold">{key}:</span>
                      <span>{valB !== undefined ? formatValue(valB) : <span className="italic opacity-50">— (missing)</span>}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Properties Block */}
            <div className="font-mono text-xs leading-relaxed max-h-80 overflow-y-auto pr-1 space-y-0.5">
              <div className="text-theme-text-muted font-semibold">properties: {'{'}</div>
              {filteredPropDiffs.map(({ key, type, valB }) => {
                if (type === 'removed') {
                  // Key is ONLY in File A -> File B shows empty placeholder line to keep alignment
                  return (
                    <div
                      key={key}
                      className="pl-4 py-0.5 rounded flex items-center justify-between bg-red-500/5 text-theme-text-muted italic border-l-2 border-transparent"
                    >
                      <span className="opacity-40">{key}: — (deleted from File B)</span>
                    </div>
                  );
                }

                const isAdded = type === 'added';
                const isModified = type === 'modified';
                const isDiff = isAdded || isModified;

                return (
                  <div
                    key={key}
                    className={`pl-4 py-0.5 rounded flex items-center justify-between transition-colors ${
                      isAdded
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border-l-2 border-emerald-500'
                        : isModified
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold border-l-2 border-sky-500'
                        : 'text-theme-text-secondary hover:bg-theme-elevated/50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className={isDiff ? 'font-bold' : 'text-theme-text-secondary'}>{key}: </span>
                      <span className={isDiff ? 'text-emerald-700 dark:text-emerald-200 font-mono' : 'text-theme-text'}>
                        "{formatValue(valB)}"
                      </span>
                    </div>
                    {isAdded && (
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shrink-0">
                        + ADDED
                      </span>
                    )}
                    {isModified && (
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 shrink-0">
                        MODIFIED
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="text-theme-text-muted font-semibold">{'}'}</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: UNIFIED GITHUB-STYLE DIFF */}
      {viewMode === 'unified' && (
        <div className="p-4 bg-theme-base/90 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto divide-y divide-theme-border/20">
          <div className="text-theme-text-muted pb-1 font-semibold text-[11px]">
            --- a/{fileAName}
            <br />
            +++ b/{fileBName}
          </div>

          {/* Display columns */}
          {colDiffs.map(({ key, type, valA, valB }) => {
            if (type === 'identical') {
              if (onlyDiffs) return null;
              return (
                <div key={key} className="py-0.5 text-theme-text-secondary pl-4">
                  &nbsp; {key}: {formatValue(valA)}
                </div>
              );
            }
            if (type === 'removed') {
              return (
                <div key={key} className="py-0.5 bg-red-500/15 text-red-700 dark:text-red-300 pl-4 font-bold border-l-2 border-red-500">
                  - {key}: {formatValue(valA)}
                </div>
              );
            }
            if (type === 'added') {
              return (
                <div key={key} className="py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 pl-4 font-bold border-l-2 border-emerald-500">
                  + {key}: {formatValue(valB)}
                </div>
              );
            }
            return (
              <React.Fragment key={key}>
                <div className="py-0.5 bg-red-500/15 text-red-700 dark:text-red-300 pl-4 font-bold border-l-2 border-red-500">
                  - {key}: {formatValue(valA)}
                </div>
                <div className="py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 pl-4 font-bold border-l-2 border-emerald-500">
                  + {key}: {formatValue(valB)}
                </div>
              </React.Fragment>
            );
          })}

          <div className="pt-2 text-theme-text-muted">properties: {'{'}</div>

          {/* Properties */}
          {filteredPropDiffs.map(({ key, type, valA, valB }) => {
            if (type === 'identical') {
              return (
                <div key={key} className="py-0.5 text-theme-text-secondary pl-6">
                  &nbsp; {key}: "{formatValue(valA)}"
                </div>
              );
            }
            if (type === 'removed') {
              return (
                <div key={key} className="py-0.5 bg-red-500/15 text-red-700 dark:text-red-300 pl-6 font-bold border-l-2 border-red-500 flex items-center justify-between">
                  <span>- {key}: "{formatValue(valA)}"</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-red-500/20 text-red-700 dark:text-red-300">deleted</span>
                </div>
              );
            }
            if (type === 'added') {
              return (
                <div key={key} className="py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 pl-6 font-bold border-l-2 border-emerald-500 flex items-center justify-between">
                  <span>+ {key}: "{formatValue(valB)}"</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">added</span>
                </div>
              );
            }
            // Modified
            return (
              <React.Fragment key={key}>
                <div className="py-0.5 bg-red-500/15 text-red-700 dark:text-red-300 pl-6 font-bold border-l-2 border-red-500 flex items-center justify-between">
                  <span>- {key}: "{formatValue(valA)}"</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-red-500/20 text-red-700 dark:text-red-300">old value</span>
                </div>
                <div className="py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 pl-6 font-bold border-l-2 border-emerald-500 flex items-center justify-between">
                  <span>+ {key}: "{formatValue(valB)}"</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">new value</span>
                </div>
              </React.Fragment>
            );
          })}
          <div className="text-theme-text-muted">{'}'}</div>
        </div>
      )}

      {/* Footer Info Bar */}
      <div className="px-4 py-2 bg-theme-elevated border-t border-theme-border flex items-center justify-between text-xs">
        {totalMismatches === 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>All attributes and nested properties match perfectly</span>
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              {totalMismatches} attribute mismatch{totalMismatches > 1 ? 'es' : ''} detected in row
              {addedCount > 0 ? ` (${addedCount} added)` : ''}
              {removedCount > 0 ? ` (${removedCount} removed)` : ''}
              {modifiedCount > 0 ? ` (${modifiedCount} modified)` : ''}
            </span>
          </span>
        )}
        <span className="text-[10px] text-theme-text-muted font-mono">Row Key: {result.row_key}</span>
      </div>
    </div>
  );
};

export default InlineDiffView;
