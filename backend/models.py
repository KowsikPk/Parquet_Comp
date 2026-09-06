from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class FileUploadResponse(BaseModel):
    file_a_id: str
    file_b_id: str
    file_a_metadata: Dict[str, Any]
    file_b_metadata: Dict[str, Any]


class ColumnFilter(BaseModel):
    column: str
    value: str
    operator: str = "equals"  # "equals", "contains", "starts_with", "ends_with", "not_equals", "not_contains", "greater_than", "less_than", "greater_equal", "less_equal"


class CompareRequest(BaseModel):
    file_a_id: str
    file_b_id: str
    columns: Optional[List[str]] = None
    display_columns: Optional[List[str]] = None  # UI IMPROVEMENT: Columns to show but not compare
    join_keys: Optional[List[str]] = None
    keyword_filter: Optional[str] = None  # Legacy keyword filter
    file_a_filters: Optional[List[ColumnFilter]] = None  # Row filters for File A
    file_b_filters: Optional[List[ColumnFilter]] = None  # Row filters for File B
    matching_strategy: Optional[str] = None  # "join_keys", "content_based"


class DifferenceDetail(BaseModel):
    column: str
    value_a: str
    value_b: str
    diff_keys: List[str] = []


class ComparisonResult(BaseModel):
    row_key: str
    status: str  # "match", "mismatch", "partial_match", "only_in_a", "only_in_b"
    match_percentage: Optional[float] = None
    differences: List[DifferenceDetail]
    row_data_a: Optional[Dict[str, str]] = None  # Actual row data from File A
    row_data_b: Optional[Dict[str, str]] = None  # Actual row data from File B


class ComparisonSummary(BaseModel):
    total_a: int
    total_b: int
    matching: int
    mismatching: int
    partial_match: int = 0
    only_in_a: int
    only_in_b: int


class CompareResponse(BaseModel):
    summary: Optional[ComparisonSummary] = None
    results: List[ComparisonResult] = []
    columns_compared: List[str] = []
    job_id: Optional[str] = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    progress: int
    error: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
