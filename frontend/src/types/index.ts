export interface FileMetadata {
  file_path: string;
  original_filename: string;
  row_count: number;
  columns: string[];
  file_size: number;
  uploaded_at: string;
  expires_at: string;
}

export interface FileUploadResponse {
  file_a_id: string;
  file_b_id: string;
  file_a_metadata: FileMetadata;
  file_b_metadata: FileMetadata;
}

export interface DifferenceDetail {
  column: string;
  value_a: string;
  value_b: string;
  diff_keys: string[];
}

export type RowStatus = 'match' | 'mismatch' | 'partial_match' | 'only_in_a' | 'only_in_b';

export interface ComparisonResult {
  row_key: string;
  status: RowStatus;
  match_percentage?: number;
  differences: DifferenceDetail[];
  row_data_a?: { [key: string]: string } | null;
  row_data_b?: { [key: string]: string } | null;
}

export interface ComparisonSummary {
  total_a: number;
  total_b: number;
  matching: number;
  mismatching: number;
  partial_match: number;
  only_in_a: number;
  only_in_b: number;
}

export interface CompareResponse {
  summary: ComparisonSummary | null;
  results: ComparisonResult[];
  columns_compared: string[];
  job_id: string | null;
}

export interface ColumnFilter {
  column: string;
  value: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'not_equals' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal';
}

export interface CompareRequest {
  file_a_id: string;
  file_b_id: string;
  columns?: string[] | null;
  display_columns?: string[] | null;  // UI IMPROVEMENT: Columns to show but not compare
  join_keys?: string[] | null;
  keyword_filter?: string | null;  // Legacy keyword filter
  file_a_filters?: ColumnFilter[] | null;  // Row filters for File A
  file_b_filters?: ColumnFilter[] | null;  // Row filters for File B
  matching_strategy?: 'join_keys' | 'content_based' | null;  // Row matching strategy
}

export interface JobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface DistinctValuesResponse {
  column: string;
  values: string[];
  total_count: number;
  truncated: boolean;
  is_sample: boolean;
  sample_size?: number;
}
