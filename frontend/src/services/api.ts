import axios from 'axios';
import type {
  FileUploadResponse,
  CompareRequest,
  CompareResponse,
  JobStatus,
  DistinctValuesResponse
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFiles = async (
  fileA: File,
  fileB: File
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file_a', fileA);
  formData.append('file_b', fileB);

  const response = await api.post<FileUploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const compareFiles = async (
  request: CompareRequest
): Promise<CompareResponse> => {
  const response = await api.post<CompareResponse>('/compare', request);
  return response.data;
};

export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
  const response = await api.get<JobStatus>(`/compare/status/${jobId}`);
  return response.data;
};

export const getJobResult = async (jobId: string): Promise<CompareResponse> => {
  const response = await api.get<CompareResponse>(`/compare/result/${jobId}`);
  return response.data;
};

export const downloadReport = async (jobId: string): Promise<void> => {
  const response = await api.get(`/report/${jobId}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `comparison_report_${jobId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const loadSampleFiles = async (): Promise<FileUploadResponse> => {
  const response = await api.get<FileUploadResponse>('/load-samples');
  return response.data;
};

export const loadIsiQuotaSamples = async (): Promise<FileUploadResponse> => {
  const response = await api.get<FileUploadResponse>('/load-isi-quota-samples');
  return response.data;
};

export const getDistinctValues = async (
  fileId: string,
  column: string,
  limit: number = 100,
  sampleSize: number = 10
): Promise<DistinctValuesResponse> => {
  const response = await api.get<DistinctValuesResponse>(
    `/distinct-values/${fileId}/${encodeURIComponent(column)}`,
    { params: { limit, sample_size: sampleSize } }
  );
  return response.data;
};

export default api;
