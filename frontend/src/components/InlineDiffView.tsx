import React from 'react';
import type { ComparisonResult } from '../types';

interface InlineDiffViewProps {
  result: ComparisonResult;
  fileAName?: string;
  fileBName?: string;
  displayColumns?: string[];  // UI IMPROVEMENT: Display-only columns
}

const InlineDiffView: React.FC<InlineDiffViewProps> = ({ result, fileAName = 'File A', fileBName = 'File B', displayColumns = [] }) => {
  // UI IMPROVEMENT: Diff detection logic
  const getDiffKeys = (propsA: any, propsB: any) => {
    if (!propsA || !propsB) return [];
    const keysA = Object.keys(propsA);
    return keysA.filter(k => JSON.stringify(propsA[k]) !== JSON.stringify(propsB[k]));
  };

  // UI IMPROVEMENT: Parse properties JSON
  const parseProperties = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  // UI IMPROVEMENT: Format value with syntax highlighting
  const formatValue = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  };

  // UI IMPROVEMENT: Get value type for syntax highlighting
  const getValueType = (value: any): 'string' | 'number' | 'boolean' | 'object' => {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'object';
  };

  // UI IMPROVEMENT: Get display columns data
  const getDisplayColumnData = (rowData: any) => {
    if (!rowData) return [];
    return displayColumns.map(col => ({
      key: col,
      value: rowData[col]
    })).filter(item => item.value !== undefined);
  };

  // UI IMPROVEMENT: Get properties data
  const getPropertiesData = (rowData: any) => {
    if (!rowData) return null;
    const propsValue = rowData['properties'];
    if (!propsValue) return null;
    return parseProperties(propsValue);
  };

  // UI IMPROVEMENT: Get ObjectClass data
  const getObjectClass = (rowData: any) => {
    if (!rowData) return null;
    return rowData['ObjectClass'];
  };

  const propsA = getPropertiesData(result.row_data_a);
  const propsB = getPropertiesData(result.row_data_b);
  const diffKeys = getDiffKeys(propsA, propsB);

  const displayDataA = getDisplayColumnData(result.row_data_a);
  const displayDataB = getDisplayColumnData(result.row_data_b);

  const objectClassA = getObjectClass(result.row_data_a);
  const objectClassB = getObjectClass(result.row_data_b);

  // UI IMPROVEMENT: Render properties with syntax highlighting
  const renderProperties = (props: any, diffKeys: string[], isFileA: boolean) => {
    if (!props) return null;

    return (
      <div className="diff-panel" style={{fontFamily: "'SF Mono', 'Consolas', monospace", fontSize: '0.8rem', lineHeight: 1.7, color: '#374151', maxHeight: '320px', overflowY: 'auto'}}>
        <div>properties: {'{'}</div>
        {Object.entries(props).map(([key, value]) => {
          const isDiff = diffKeys.includes(key);
          const valueType = getValueType(value);
          const valueColor = valueType === 'string' ? '#2563eb' : valueType === 'number' ? '#059669' : '#374151';
          const bgColor = isDiff ? (isFileA ? '#fef2f2' : '#f0fdf4') : 'transparent';
          const fontWeight = isDiff ? 700 : 400;

          return (
            <div key={key} style={{paddingLeft: '1rem', backgroundColor: bgColor, fontWeight: fontWeight}}>
              <span style={{color: '#374151'}}>{key}:</span>
              <span style={{color: valueColor}}>{formatValue(value)}</span>
              {isDiff && <span style={{color: '#9ca3af', marginLeft: '4px'}}>Δ</span>}
            </div>
          );
        })}
        <div>{'}'}</div>
      </div>
    );
  };

  // UI IMPROVEMENT: Render display columns
  const renderDisplayColumns = (displayData: Array<{key: string, value: any}>) => {
    if (displayData.length === 0) return null;

    return (
      <div className="space-y-2 mb-4">
        {displayData.map(({key, value}) => (
          <div key={key} className="flex items-start">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-500" style={{fontSize: '0.75rem', marginTop: '2px'}}>
              <path d="M1 12s4-8 11-8 11 8 11 8 11-8 11-8 11-8-4 4-4 4"/>
              <path d="M2.5 7c0 0 2.5 2.5 2.5 2.5"/>
              <path d="M2.5 17c0 0 2.5 2.5 2.5 2.5"/>
            </svg>
            <div>
              <div style={{color: '#6b7280', fontSize: '0.8rem'}}>{key}:</div>
              <div style={{color: '#111827', fontWeight: 600, fontSize: '0.8rem'}}>{formatValue(value)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    // UI IMPROVEMENT: Container with new styling
    <div style={{borderLeft: '3px solid #3b82f6', backgroundColor: '#f8faff', borderRadius: '0 12px 12px 0', padding: 0, margin: '4px 0 12px 0', overflow: 'hidden'}}>
      {/* UI IMPROVEMENT: Two-column grid layout */}
      <div className="grid grid-cols-2" style={{display: 'grid', gridTemplateColumns: '50% 50%', borderBottom: '1px solid #e5e7eb'}}>
        {/* File A Panel */}
        <div>
          {/* UI IMPROVEMENT: File A header */}
          <div style={{backgroundColor: '#eff6ff', padding: '10px 16px', borderBottom: '1px solid #dbeafe'}}>
            <div className="flex items-center">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '0.875rem', color: '#3b82f6'}}>
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
              <span style={{color: '#2563eb', fontSize: '0.8rem', fontWeight: 600}} title={fileAName}>
                {fileAName.length > 30 ? fileAName.substring(0, 30) + '...' : fileAName}
              </span>
            </div>
          </div>
          {/* UI IMPROVEMENT: File A content */}
          <div style={{padding: '16px'}}>
            {renderDisplayColumns(displayDataA)}
            {objectClassA && (
              <div className="mb-4">
                <div style={{color: '#6b7280', fontSize: '0.8rem'}}>ObjectClass:</div>
                <div style={{color: '#111827', fontWeight: 600, fontSize: '0.8rem'}}>{objectClassA}</div>
              </div>
            )}
            {renderProperties(propsA, diffKeys, true)}
          </div>
        </div>

        {/* File B Panel */}
        <div style={{borderLeft: '1px solid #e5e7eb'}}>
          {/* UI IMPROVEMENT: File B header */}
          <div style={{backgroundColor: '#faf5ff', padding: '10px 16px', borderBottom: '1px solid #e9d5ff'}}>
            <div className="flex items-center">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '0.875rem', color: '#9333ea'}}>
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
              <span style={{color: '#7c3aed', fontSize: '0.8rem', fontWeight: 600}} title={fileBName}>
                {fileBName.length > 30 ? fileBName.substring(0, 30) + '...' : fileBName}
              </span>
            </div>
          </div>
          {/* UI IMPROVEMENT: File B content */}
          <div style={{padding: '16px'}}>
            {renderDisplayColumns(displayDataB)}
            {objectClassB && (
              <div className="mb-4">
                <div style={{color: '#6b7280', fontSize: '0.8rem'}}>ObjectClass:</div>
                <div style={{color: '#111827', fontWeight: 600, fontSize: '0.8rem'}}>{objectClassB}</div>
              </div>
            )}
            {renderProperties(propsB, diffKeys, false)}
          </div>
        </div>
      </div>

      {/* UI IMPROVEMENT: Panel footer */}
      {result.status === 'match' && (!result.differences || result.differences.length === 0) ? (
        <div style={{backgroundColor: '#f0fdf4', borderLeft: '3px solid #22c55e', padding: '10px 16px', display: 'flex', alignItems: 'center'}}>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '0.875rem', color: '#16a34a'}}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span style={{color: '#16a34a', fontSize: '0.8rem', fontWeight: 500}}>
            ✓ Values match (JSON key order ignored, strict comparison)
          </span>
        </div>
      ) : (
        <div style={{backgroundColor: '#fef2f2', borderLeft: '3px solid #ef4444', padding: '10px 16px', display: 'flex', alignItems: 'center'}}>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '0.875rem', color: '#dc2626'}}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span style={{color: '#dc2626', fontSize: '0.8rem', fontWeight: 500}}>
            ✗ Values differ — {diffKeys.length} field(s) changed
          </span>
        </div>
      )}
    </div>
  );
};

export default InlineDiffView;
