import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import StepIndicator from './components/StepIndicator';
import StepContainer from './components/StepContainer';
import FileUpload from './components/FileUpload';
import ColumnSelector from './components/ColumnSelector';
import JoinKeySelector from './components/JoinKeySelector';
import AdvancedFilter from './components/AdvancedFilter';
import ComparisonSummary from './components/ComparisonSummary';
import ResultsTable from './components/ResultsTable';
import ExportDropdown from './components/ExportDropdown';
import LoadingSkeleton from './components/LoadingSkeleton';
import ResultsFilterPanel from './components/ResultsFilterPanel';
import { uploadFiles, compareFiles, getJobStatus, getJobResult, downloadReport, loadSampleFiles } from './services/api';
import type { CompareResponse, JobStatus, ColumnFilter } from './types';

const App: React.FC = () => {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('parquet-compare-theme') === 'dark';
  });

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Existing state
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [compareAll, setCompareAll] = useState(false);
  const [selectedJoinKeys, setSelectedJoinKeys] = useState<string[]>([]);
  const [matchingStrategy, setMatchingStrategy] = useState<'join_keys' | 'content_based'>('content_based');
  const [displayColumns, setDisplayColumns] = useState<string[]>([]);  // UI IMPROVEMENT: Display-only columns
  const [fileAFilters, setFileAFilters] = useState<ColumnFilter[]>([]);
  const [fileBFilters, setFileBFilters] = useState<ColumnFilter[]>([]);
  const [comparisonResult, setComparisonResult] = useState<CompareResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'match' | 'mismatch' | 'only_in_a' | 'only_in_b'>('all');

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('parquet-compare-theme', !isDarkMode ? 'dark' : 'light');
  };

  // Apply dark mode to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-advance to step 2 after upload
  useEffect(() => {
    if (uploadResponse && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [uploadResponse, currentStep]);

  // Auto-advance to step 3 after comparison
  useEffect(() => {
    if (comparisonResult && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [comparisonResult, currentStep]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentStep(1);
            break;
          case '2':
            e.preventDefault();
            if (uploadResponse) setCurrentStep(2);
            break;
          case '3':
            e.preventDefault();
            if (comparisonResult) setCurrentStep(3);
            break;
          case 'f':
            e.preventDefault();
            // Focus search input if in results step
            if (currentStep === 3) {
              const searchInput = document.querySelector('input[placeholder="Search by row key or value…"]');
              if (searchInput) (searchInput as HTMLInputElement).focus();
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowUp':
          case 'ArrowDown':
            // Navigate expanded rows (implement if needed)
            break;
          case ' ':
            // Expand/collapse focused row (implement if needed)
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, uploadResponse, comparisonResult]);

  const handleFileASelect = (file: File) => {
    setFileA(file);
    setError(null);
  };

  const handleFileBSelect = (file: File) => {
    setFileB(file);
    setError(null);
  };

  const handleFileARemove = () => {
    setFileA(null);
    setError(null);
  };

  const handleFileBRemove = () => {
    setFileB(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!fileA || !fileB) {
      setError('Please select both files');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const response = await uploadFiles(fileA, fileB);
      setUploadResponse(response);
      
      // Initialize column selection with all common columns
      const commonColumns = response.file_a_metadata.columns.filter(
        (col: string) => response.file_b_metadata.columns.includes(col)
      );
      setSelectedColumns(commonColumns);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setIsComparing(false);
    }
  };

  const handleCompare = async () => {
    if (!uploadResponse) {
      setError('Please upload files first');
      return;
    }

    if (!compareAll && selectedColumns.length === 0) {
      setError('Please select at least one column to compare');
      return;
    }

    // Only require join keys for join_keys strategy
    if (matchingStrategy === 'join_keys' && selectedJoinKeys.length === 0) {
      setError('Please select at least one join key column');
      return;
    }

    setIsComparing(true);
    setError(null);
    setProgress(0);
    setComparisonResult(null); // Clear previous results

    try {
      const request = {
        file_a_id: uploadResponse.file_a_id,
        file_b_id: uploadResponse.file_b_id,
        columns: compareAll ? null : selectedColumns,
        display_columns: displayColumns.length > 0 ? displayColumns : null,  // UI IMPROVEMENT: Display-only columns
        join_keys: matchingStrategy === 'join_keys' ? selectedJoinKeys : null,
        keyword_filter: null,  // Disabled in favor of advanced filters
        file_a_filters: fileAFilters.length > 0 ? fileAFilters : null,
        file_b_filters: fileBFilters.length > 0 ? fileBFilters : null,
        matching_strategy: matchingStrategy
      };

      console.log('Sending compare request:', JSON.stringify(request, null, 2));
      const response = await compareFiles(request);
      console.log('Compare response:', response);

      if (response.job_id) {
        // Async comparison - poll for status
        console.log('Starting async comparison with job_id:', response.job_id);
        pollJobStatus(response.job_id);
      } else {
        // Sync comparison - immediate result
        console.log('Sync comparison, immediate result');
        setComparisonResult(response);
        setProgress(100);
      }
    } catch (err: any) {
      console.error('Comparison error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Comparison failed';
      setError(errorMessage);
      setProgress(0);
    } finally {
      setIsComparing(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    console.log('Starting to poll job:', jobId);
    const pollInterval = setInterval(async () => {
      try {
        const status: JobStatus = await getJobStatus(jobId);
        console.log('Job status:', status);
        setProgress(status.progress);

        if (status.status === 'completed') {
          console.log('Job completed, fetching result');
          clearInterval(pollInterval);
          try {
            const result = await getJobResult(jobId);
            console.log('Job result received:', result);
            
            if (result && result.summary) {
              console.log('Setting comparison result');
              setComparisonResult(result);
              setIsComparing(false);
            } else {
              console.error('Invalid result format:', result);
              setError('Invalid result format received from server');
              setIsComparing(false);
            }
          } catch (err: any) {
            console.error('Error fetching job result:', err);
            setError(err.response?.data?.detail || 'Failed to get job result');
            setIsComparing(false);
          }
        } else if (status.status === 'failed') {
          console.log('Job failed');
          clearInterval(pollInterval);
          setError(status.error || 'Comparison failed');
          setIsComparing(false);
        }
      } catch (err: any) {
        console.error('Error polling job status:', err);
        clearInterval(pollInterval);
        setError(err.response?.data?.detail || 'Failed to get job status');
        setIsComparing(false);
      }
    }, 1000);
  };

  const handleDownloadReport = async () => {
    if (!comparisonResult?.job_id) return;

    try {
      await downloadReport(comparisonResult.job_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to download report');
    }
  };

  const handleLoadSamples = async () => {
    setIsComparing(true);
    setError(null);

    try {
      const response = await loadSampleFiles();
      setUploadResponse(response);
      
      // Initialize column selection with all common columns
      const commonColumns = response.file_a_metadata.columns.filter(
        (col: string) => response.file_b_metadata.columns.includes(col)
      );
      setSelectedColumns(commonColumns);
      
      // Set file names for display
      setFileA(new File([], "sample_a.parquet"));
      setFileB(new File([], "sample_b.parquet"));
      
      // Clear filters
      setFileAFilters([]);
      setFileBFilters([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sample files');
    } finally {
      setIsComparing(false);
    }
  };

  const commonColumns = uploadResponse
    ? uploadResponse.file_a_metadata.columns.filter(
        (col: string) => uploadResponse.file_b_metadata.columns.includes(col)
      )
    : [];

  // Helper variables for display filenames throughout the flow
  const fileADisplayName = uploadResponse?.file_a_metadata?.original_filename || fileA?.name || 'File A';
  const fileBDisplayName = uploadResponse?.file_b_metadata?.original_filename || fileB?.name || 'File B';

  return (
    <div className="min-h-screen max-w-full bg-gray-100 dark:bg-[#0F1117] flex flex-col overflow-x-hidden">
      {/* Top Navigation */}
      <TopNav onThemeToggle={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Left Sidebar */}
        <LeftSidebar
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          hasFiles={!!uploadResponse}
          hasResults={!!comparisonResult}
        />

        {/* Main Content */}
        <MainContent>
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Step 1: File Upload */}
          <StepContainer step={1} currentStep={currentStep}>
            <div className="bg-white dark:bg-[#1A1D27] rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F1F5F9]">Upload Files</h2>
                <button
                  onClick={handleLoadSamples}
                  className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500 text-sm"
                >
                  Load Basic Sample
                </button>
              </div>
              
              <div className="flex space-x-4 mb-4">
                <FileUpload
                  label="File A"
                  onFileSelect={handleFileASelect}
                  selectedFile={fileA}
                  disabled={isComparing}
                  metadata={uploadResponse?.file_a_metadata}
                  onRemove={handleFileARemove}
                />
                <FileUpload
                  label="File B"
                  onFileSelect={handleFileBSelect}
                  selectedFile={fileB}
                  disabled={isComparing}
                  metadata={uploadResponse?.file_b_metadata}
                  onRemove={handleFileBRemove}
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!fileA || !fileB || isComparing}
                className="w-full px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isComparing ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </StepContainer>

          {/* Step 2: Configuration */}
          <StepContainer step={2} currentStep={currentStep}>
            {uploadResponse ? (
              <div className="space-y-6">
                {/* Column Selection */}
                <ColumnSelector
                  columnsA={uploadResponse.file_a_metadata.columns}
                  columnsB={uploadResponse.file_b_metadata.columns}
                  selectedColumns={selectedColumns}
                  onColumnToggle={(col) => {
                    setSelectedColumns(prev =>
                      prev.includes(col)
                        ? prev.filter(c => c !== col)
                        : [...prev, col]
                    );
                  }}
                  onSelectAll={() => setSelectedColumns(commonColumns)}
                  onClearAll={() => setSelectedColumns([])}
                  compareAll={compareAll}
                  onCompareAllChange={setCompareAll}
                  displayColumns={displayColumns}  // UI IMPROVEMENT: Display-only columns
                  onDisplayColumnChange={setDisplayColumns}  // UI IMPROVEMENT: Display column change handler
                  fileAName={fileADisplayName}
                  fileBName={fileBDisplayName}
                />

                {/* Join Key Selection */}
                <JoinKeySelector
                  commonColumns={commonColumns}
                  selectedJoinKeys={selectedJoinKeys}
                  onJoinKeyToggle={(key) => {
                    setSelectedJoinKeys(prev =>
                      prev.includes(key)
                        ? prev.filter(k => k !== key)
                        : [...prev, key]
                    );
                  }}
                  matchingStrategy={matchingStrategy}
                  onMatchingStrategyChange={setMatchingStrategy}
                />

                {/* UI IMPROVEMENT #10: Advanced Row Filters with color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdvancedFilter
                    columns={uploadResponse.file_a_metadata.columns}
                    filters={fileAFilters}
                    onFiltersChange={setFileAFilters}
                    label={`${fileADisplayName} Row Filters`}
                    disabled={isComparing}
                    fileId={uploadResponse.file_a_id}
                    copyFromFilters={fileBFilters}
                    onCopyFromFilters={setFileAFilters}
                    fileColor="blue"
                  />
                  <AdvancedFilter
                    columns={uploadResponse.file_b_metadata.columns}
                    filters={fileBFilters}
                    onFiltersChange={setFileBFilters}
                    label={`${fileBDisplayName} Row Filters`}
                    disabled={isComparing}
                    fileId={uploadResponse.file_b_id}
                    copyFromFilters={fileAFilters}
                    onCopyFromFilters={setFileBFilters}
                    fileColor="purple"
                  />
                </div>

                {/* UI IMPROVEMENT #11: Compare Button with icons */}
                <div>
                  <button
                    onClick={handleCompare}
                    disabled={isComparing || (!compareAll && selectedColumns.length === 0)}
                    className="w-full px-4 py-3 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium flex items-center justify-center transition-all"
                    style={{minWidth: '80px'}}
                    title={!compareAll && selectedColumns.length === 0 ? 'Select at least one column to compare' : ''}
                  >
                    {isComparing ? (
                      <>
                        {/* UI IMPROVEMENT #11: SPINNER icon for loading state */}
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 animate-spin" style={{fontSize: '1.125rem'}}>
                          <line x1="12" y1="2" x2="12" y2="6"/>
                          <line x1="12" y1="18" x2="12" y2="22"/>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                          <line x1="2" y1="12" x2="6" y2="12"/>
                          <line x1="18" y1="12" x2="22" y2="12"/>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                        </svg>
                        Comparing...
                      </>
                    ) : (
                      <>
                        {/* UI IMPROVEMENT #11: REFRESH icon for enabled state */}
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{fontSize: '1.125rem'}}>
                          <polyline points="1 4 1 10 7 10"/>
                          <polyline points="23 20 23 14 17 14"/>
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                        </svg>
                        Compare Files
                      </>
                    )}
                  </button>

                  {/* Progress Bar */}
                  {isComparing && (
                    <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Processing comparison...</span>
                        <span className="font-mono">{progress > 0 ? `${progress}%` : 'Initializing...'}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {progress === 0 && 'Preparing data...'}
                          {progress > 0 && progress < 100 && 'Comparing rows...'}
                          {progress === 100 && 'Finalizing results...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Please upload files first to configure comparison settings</p>
              </div>
            )}
          </StepContainer>

          {/* Step 3: Results */}
          <StepContainer step={3} currentStep={currentStep}>
            {isComparing ? (
              <LoadingSkeleton />
            ) : comparisonResult && comparisonResult.summary ? (
              <div className="space-y-6">
                {/* Editable Filter Panel */}
                {uploadResponse && (
                  <ResultsFilterPanel
                    columnsA={uploadResponse.file_a_metadata.columns}
                    columnsB={uploadResponse.file_b_metadata.columns}
                    fileAFilters={fileAFilters}
                    fileBFilters={fileBFilters}
                    onFileAFiltersChange={setFileAFilters}
                    onFileBFiltersChange={setFileBFilters}
                    onRerunComparison={handleCompare}
                    isComparing={isComparing}
                    fileAName={fileADisplayName}
                    fileBName={fileBDisplayName}
                    fileAId={uploadResponse.file_a_id}
                    fileBId={uploadResponse.file_b_id}
                    copyFromAFilters={fileBFilters}
                    copyFromBFilters={fileAFilters}
                  />
                )}

                <ComparisonSummary
                  summary={comparisonResult.summary}
                  columnsCompared={comparisonResult.columns_compared}
                  fileAName={fileADisplayName}
                  fileBName={fileBDisplayName}
                />

                <div className="flex justify-end">
                  <ExportDropdown 
                    comparisonResult={comparisonResult}
                    onDownloadReport={handleDownloadReport}
                    fileAName={fileADisplayName}
                    fileBName={fileBDisplayName}
                  />
                </div>

                <ResultsTable
                  results={comparisonResult.results}
                  filter={filter}
                  onFilterChange={setFilter}
                  columnsCompared={comparisonResult.columns_compared}
                  displayColumns={displayColumns}  // UI IMPROVEMENT: Display-only columns
                  fileAName={fileADisplayName}
                  fileBName={fileBDisplayName}
                />
              </div>
            ) : null}
          </StepContainer>
        </MainContent>
      </div>
    </div>
  );
};

export default App;
