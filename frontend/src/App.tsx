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
import EmptyState from './components/EmptyState';
import GlobalLoading from './components/GlobalLoading';
import { uploadFiles, compareFiles, getJobStatus, getJobResult, downloadReport, loadSampleFiles } from './services/api';
import type { CompareResponse, JobStatus, ColumnFilter } from './types';

const App: React.FC = () => {
  // Dark mode state - default to true for modern dark experience
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('parquet-compare-theme');
    return saved ? saved === 'dark' : true;
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
  const [displayColumns, setDisplayColumns] = useState<string[]>([]);
  const [fileAFilters, setFileAFilters] = useState<ColumnFilter[]>([]);
  const [fileBFilters, setFileBFilters] = useState<ColumnFilter[]>([]);
  const [comparisonResult, setComparisonResult] = useState<CompareResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'match' | 'mismatch' | 'partial_match' | 'only_in_a' | 'only_in_b'>('all');

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
            if (currentStep === 3) {
              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
              if (searchInput) searchInput.focus();
            }
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
      setError('Please select both files to continue comparison');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const response = await uploadFiles(fileA, fileB);
      setUploadResponse(response);
      
      const commonCols = response.file_a_metadata.columns.filter(
        (col: string) => response.file_b_metadata.columns.includes(col)
      );
      setSelectedColumns(commonCols);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'File upload failed');
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

    if (matchingStrategy === 'join_keys' && selectedJoinKeys.length === 0) {
      setError('Please select at least one join key column');
      return;
    }

    setIsComparing(true);
    setError(null);
    setProgress(0);
    setComparisonResult(null);

    try {
      const request = {
        file_a_id: uploadResponse.file_a_id,
        file_b_id: uploadResponse.file_b_id,
        columns: compareAll ? null : selectedColumns,
        display_columns: displayColumns.length > 0 ? displayColumns : null,
        join_keys: matchingStrategy === 'join_keys' ? selectedJoinKeys : null,
        keyword_filter: null,
        file_a_filters: fileAFilters.length > 0 ? fileAFilters : null,
        file_b_filters: fileBFilters.length > 0 ? fileBFilters : null,
        matching_strategy: matchingStrategy
      };

      const response = await compareFiles(request);

      if (response.job_id) {
        // pollJobStatus handles setIsComparing(false) on completion/failure
        pollJobStatus(response.job_id);
      } else {
        setComparisonResult(response);
        setProgress(100);
        setIsComparing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Comparison execution failed');
      setProgress(0);
      setIsComparing(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status: JobStatus = await getJobStatus(jobId);
        setProgress(status.progress);

        if (status.status === 'completed') {
          clearInterval(pollInterval);
          try {
            const result = await getJobResult(jobId);
            if (result && result.summary) {
              setComparisonResult(result);
              setIsComparing(false);
            } else {
              setError('Invalid result response from backend server');
              setIsComparing(false);
            }
          } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to retrieve comparison result');
            setIsComparing(false);
          }
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setError(status.error || 'Comparison execution failed');
          setIsComparing(false);
        }
      } catch (err: any) {
        clearInterval(pollInterval);
        setError(err.response?.data?.detail || 'Failed to poll job status');
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
      
      const commonCols = response.file_a_metadata.columns.filter(
        (col: string) => response.file_b_metadata.columns.includes(col)
      );
      setSelectedColumns(commonCols);
      
      setFileA(new File([], "sample_a.parquet"));
      setFileB(new File([], "sample_b.parquet"));
      
      setFileAFilters([]);
      setFileBFilters([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sample dataset');
    } finally {
      setIsComparing(false);
    }
  };

  const commonColumns = uploadResponse
    ? uploadResponse.file_a_metadata.columns.filter(
        (col: string) => uploadResponse.file_b_metadata.columns.includes(col)
      )
    : [];

  const fileADisplayName = uploadResponse?.file_a_metadata?.original_filename || fileA?.name || 'File A';
  const fileBDisplayName = uploadResponse?.file_b_metadata?.original_filename || fileB?.name || 'File B';

  return (
    <div className="min-h-screen w-full bg-theme-base text-theme-text flex flex-col overflow-x-hidden font-sans">
      {isComparing && <GlobalLoading message="Computing Deep Column Diffs..." progress={progress} />}
      <TopNav onThemeToggle={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="flex flex-1 overflow-hidden min-w-0">
        <LeftSidebar
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          hasFiles={!!uploadResponse}
          hasResults={!!comparisonResult}
        />

        <MainContent>
          <StepIndicator currentStep={currentStep} />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center justify-between text-xs font-medium animate-fade-in shadow-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Step 1: File Upload */}
          <StepContainer step={1} currentStep={currentStep}>
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="text-center py-6 space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-theme-text tracking-tight">
                  Compare Parquet Datasets with Precision
                </h2>
                <p className="text-xs md:text-sm text-theme-text-secondary max-w-xl mx-auto">
                  Deep JSON attribute inspection, key-based or content-based row matching, and diff reports.
                </p>
              </div>

              {/* Upload Card Grid */}
              <div className="bg-theme-surface border border-theme-border rounded-2xl p-6 shadow-2xl relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-bold text-theme-text">Upload Input Datasets</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSamples}
                    className="px-3 py-1.5 bg-theme-elevated hover:bg-theme-muted text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Load Demo Dataset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <FileUpload
                    label="File A (Base)"
                    onFileSelect={handleFileASelect}
                    selectedFile={fileA}
                    disabled={isComparing}
                    metadata={uploadResponse?.file_a_metadata}
                    onRemove={handleFileARemove}
                    accentColor="indigo"
                  />

                  {/* VS Badge */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-theme-elevated border border-theme-border items-center justify-center text-xs font-black font-mono text-blue-400 shadow-xl z-10">
                    VS
                  </div>

                  <FileUpload
                    label="File B (Target)"
                    onFileSelect={handleFileBSelect}
                    selectedFile={fileB}
                    disabled={isComparing}
                    metadata={uploadResponse?.file_b_metadata}
                    onRemove={handleFileBRemove}
                    accentColor="violet"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!fileA || !fileB || isComparing}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 disabled:from-theme-elevated disabled:to-theme-elevated disabled:text-theme-text-muted text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center space-x-2"
                >
                  {isComparing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Analyzing File Metadata...</span>
                    </>
                  ) : (
                    <>
                      <span>Inspect Schema & Continue</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </StepContainer>

          {/* Step 2: Configuration */}
          <StepContainer step={2} currentStep={currentStep}>
            {uploadResponse ? (
              <div className="space-y-6">
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
                  displayColumns={displayColumns}
                  onDisplayColumnChange={setDisplayColumns}
                  fileAName={fileADisplayName}
                  fileBName={fileBDisplayName}
                />

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdvancedFilter
                    columns={uploadResponse.file_a_metadata.columns}
                    filters={fileAFilters}
                    onFiltersChange={setFileAFilters}
                    label={`${fileADisplayName} Filters`}
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
                    label={`${fileBDisplayName} Filters`}
                    disabled={isComparing}
                    fileId={uploadResponse.file_b_id}
                    copyFromFilters={fileAFilters}
                    onCopyFromFilters={setFileBFilters}
                    fileColor="purple"
                  />
                </div>

                {/* Compare Action Section */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleCompare}
                    disabled={isComparing || (!compareAll && selectedColumns.length === 0)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-theme-elevated disabled:to-theme-elevated disabled:text-theme-text-muted text-white font-extrabold rounded-xl shadow-xl shadow-emerald-500/20 transition-all text-sm flex items-center justify-center space-x-2"
                  >
                    {isComparing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Computing Deep Column Diffs...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span>Execute Parquet Diff Engine</span>
                      </>
                    )}
                  </button>

                  {isComparing && (
                    <div className="bg-theme-surface border border-theme-border rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-xs text-theme-text-secondary">
                        <span className="font-semibold">Processing row evaluation...</span>
                        <span className="font-mono text-blue-400 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-theme-elevated rounded-full h-2 overflow-hidden border border-theme-border">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                icon="upload"
                title="No Datasets Loaded"
                description="Please select and upload base and target Parquet files to configure comparison parameters."
                action={{
                  label: "Go to File Upload",
                  onClick: () => setCurrentStep(1)
                }}
              />
            )}
          </StepContainer>

          {/* Step 3: Results */}
          <StepContainer step={3} currentStep={currentStep}>
            {isComparing ? (
              <LoadingSkeleton />
            ) : comparisonResult && comparisonResult.summary ? (
              <div className="space-y-6">
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
                  fileAName={fileADisplayName}
                  fileBName={fileBDisplayName}
                />
              </div>
            ) : (
              <EmptyState
                icon="database"
                title="No Comparison Results"
                description="Run the comparison engine in Step 2 to generate deep diffs and inspect results."
                action={{
                  label: "Go to Configure",
                  onClick: () => setCurrentStep(2)
                }}
              />
            )}
          </StepContainer>
        </MainContent>
      </div>
    </div>
  );
};

export default App;
