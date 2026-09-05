import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
import uuid
from datetime import datetime
from json_normalizer import normalize_value, values_are_equal, compare_json_objects, get_json_differences, ensure_scalar


class ComparisonJob:
    def __init__(self, job_id: str):
        self.job_id = job_id
        self.status = "pending"
        self.progress = 0
        self.result = None
        self.error = None
        self.started_at = datetime.now()
        self.completed_at = None


class ComparisonEngine:
    def __init__(self):
        self.jobs: Dict[str, ComparisonJob] = {}
    
    def create_job(self) -> str:
        """Create a new comparison job and return job_id."""
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = ComparisonJob(job_id)
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[Dict]:
        """Get status of a comparison job."""
        job = self.jobs.get(job_id)
        if not job:
            return None
        
        return {
            "job_id": job.job_id,
            "status": job.status,
            "progress": job.progress,
            "error": job.error,
            "started_at": job.started_at.isoformat(),
            "completed_at": job.completed_at.isoformat() if job.completed_at else None
        }
    
    def compare_dataframes(
        self,
        df_a: pd.DataFrame,
        df_b: pd.DataFrame,
        columns: Optional[List[str]] = None,
        display_columns: Optional[List[str]] = None,  # UI IMPROVEMENT: Columns to show but not compare
        join_keys: Optional[List[str]] = None,
        keyword_filter: Optional[str] = None,
        file_a_filters: Optional[List[Dict]] = None,
        file_b_filters: Optional[List[Dict]] = None,
        job_id: Optional[str] = None,
        chunk_size: int = 10000,
        matching_strategy: Optional[str] = None
    ) -> Dict[str, Any]:
        """Compare two DataFrames with JSON-aware comparison."""
        
        if job_id:
            job = self.jobs.get(job_id)
            if job:
                job.status = "processing"
                job.progress = 0
        
        # Apply row-level filters if specified (OR logic - rows matching ANY filter are included)
        if file_a_filters:
            df_a = self._apply_filters(df_a, file_a_filters)
        if file_b_filters:
            df_b = self._apply_filters(df_b, file_b_filters)
        
        # Determine columns to compare
        if columns is None:
            # Use intersection of columns
            columns = list(set(df_a.columns) & set(df_b.columns))
        
        # Remove temporary join key column from comparison if it exists
        columns = [col for col in columns if col != '_join_key']
        
        # UI IMPROVEMENT: Combine columns for row data inclusion (comparison + display)
        all_display_columns = (columns or []) + (display_columns or [])
        
        # Check for content-based matching strategy
        if matching_strategy == "content_based":
            print(f"Using content-based matching strategy")
            print(f"Matching rows where selected column values are equal (order-independent)")
            
            try:
                results, stats = self._compare_content_based(
                    df_a,
                    df_b,
                    columns,
                    all_display_columns,  # UI IMPROVEMENT: Pass all columns for display
                    keyword_filter
                )
                matching = stats["matching"]
                mismatching = stats["mismatching"]
                only_in_a = stats["only_in_a"]
                only_in_b = stats["only_in_b"]
                
                summary = {
                    "total_a": len(df_a),
                    "total_b": len(df_b),
                    "matching": matching,
                    "mismatching": mismatching,
                    "only_in_a": only_in_a,
                    "only_in_b": only_in_b
                }
                
                result = {
                    "summary": summary,
                    "results": results,
                    "columns_compared": columns
                }
                
                if job_id:
                    job = self.jobs.get(job_id)
                    if job:
                        job.status = "completed"
                        job.progress = 100
                        job.result = result
                        job.completed_at = datetime.now()
                
                return result
            except Exception as e:
                print(f"Error in content-based comparison: {e}")
                import traceback
                traceback.print_exc()
                raise
        
        # Determine join strategy
        use_index = True
        if join_keys and len(join_keys) > 0:
            # Check if all join keys exist in both dataframes
            keys_in_a = all(key in df_a.columns for key in join_keys)
            keys_in_b = all(key in df_b.columns for key in join_keys)
            
            print(f"Join keys: {join_keys}, keys_in_a: {keys_in_a}, keys_in_b: {keys_in_b}")
            
            if keys_in_a and keys_in_b:
                # Check if join keys are unique (warn if not)
                for key in join_keys:
                    unique_a = df_a[key].nunique()
                    unique_b = df_b[key].nunique()
                    total_a = len(df_a)
                    total_b = len(df_b)
                    
                    if unique_a < total_a * 0.9:  # Less than 90% unique
                        print(f"WARNING: Join key '{key}' has {unique_a} unique values out of {total_a} rows in File A - may not be a good unique identifier")
                    if unique_b < total_b * 0.9:
                        print(f"WARNING: Join key '{key}' has {unique_b} unique values out of {total_b} rows in File B - may not be a good unique identifier")
                
                # Use join keys - convert to string for consistent indexing
                try:
                    # Create composite key column for reliable matching
                    print(f"Creating composite join key from: {join_keys}")
                    if len(join_keys) == 1:
                        df_a['_join_key'] = df_a[join_keys[0]].astype(str)
                        df_b['_join_key'] = df_b[join_keys[0]].astype(str)
                    else:
                        df_a['_join_key'] = df_a[join_keys[0]].astype(str)
                        df_b['_join_key'] = df_b[join_keys[0]].astype(str)
                        for key in join_keys[1:]:
                            df_a['_join_key'] = df_a['_join_key'] + '|' + df_a[key].astype(str)
                            df_b['_join_key'] = df_b['_join_key'] + '|' + df_b[key].astype(str)
                    
                    print(f"Setting join key as index")
                    df_a_indexed = df_a.set_index('_join_key', drop=False)
                    df_b_indexed = df_b.set_index('_join_key', drop=False)
                    use_index = False
                    print(f"Join key indexing successful")
                except Exception as e:
                    # Fallback to row index if join keys fail
                    print(f"Join keys failed, falling back to row index: {e}")
                    import traceback
                    traceback.print_exc()
                    df_a_indexed = df_a.reset_index(drop=True)
                    df_b_indexed = df_b.reset_index(drop=True)
                    use_index = True
            else:
                # Use row index if keys not found
                print(f"Join keys not found in both dataframes, using row index")
                df_a_indexed = df_a.reset_index(drop=True)
                df_b_indexed = df_b.reset_index(drop=True)
                use_index = True
        else:
            # Use row index - but warn about potential order issues
            print(f"No join keys provided, using row index")
            print(f"WARNING: Row index comparison assumes rows are in the same order in both files.")
            print(f"For files with different row orders, please specify join keys for accurate matching.")
            df_a_indexed = df_a.reset_index(drop=True)
            df_b_indexed = df_b.reset_index(drop=True)
            use_index = True
        
        # Initialize counters
        total_rows = max(len(df_a_indexed), len(df_b_indexed))
        print(f"Total rows for comparison: {total_rows} (A: {len(df_a_indexed)}, B: {len(df_b_indexed)})")
        matching = 0
        mismatching = 0
        only_in_a = 0
        only_in_b = 0
        
        results = []
        
        # Process in chunks if large
        if total_rows > chunk_size:
            print(f"Processing in chunks (chunk_size: {chunk_size})")
            num_chunks = (total_rows + chunk_size - 1) // chunk_size
            print(f"Number of chunks: {num_chunks}")
            
            # Pre-calculate keys if using join keys
            all_keys = None
            if not use_index:
                all_keys = sorted(set(df_a_indexed.index.tolist()) | set(df_b_indexed.index.tolist()))
                
            for chunk_idx in range(num_chunks):
                start_idx = chunk_idx * chunk_size
                end_idx = min((chunk_idx + 1) * chunk_size, total_rows)
                
                print(f"Processing chunk {chunk_idx + 1}/{num_chunks} (rows {start_idx}-{end_idx})")
                
                # Handle chunking differently based on index type
                if use_index:
                    # Positional indexing for row index
                    chunk_a = df_a_indexed.iloc[start_idx:end_idx]
                    chunk_b = df_b_indexed.iloc[start_idx:end_idx]
                else:
                    # For join keys: chunk by key groups
                    chunk_keys = all_keys[start_idx:end_idx]
                    chunk_a = df_a_indexed[df_a_indexed.index.isin(chunk_keys)]
                    chunk_b = df_b_indexed[df_b_indexed.index.isin(chunk_keys)]
                
                print(f"Chunk sizes: A={len(chunk_a)}, B={len(chunk_b)}")
                
                try:
                    chunk_results, chunk_stats = self._compare_chunk(
                        chunk_a,
                        chunk_b,
                        columns,  # UI IMPROVEMENT: Pass as comparison_columns
                        all_display_columns,  # UI IMPROVEMENT: Pass all columns for display
                        use_index,
                        keyword_filter
                    )
                    
                    results.extend(chunk_results)
                    matching += chunk_stats["matching"]
                    mismatching += chunk_stats["mismatching"]
                    only_in_a += chunk_stats["only_in_a"]
                    only_in_b += chunk_stats["only_in_b"]
                    
                    if job_id:
                        job = self.jobs.get(job_id)
                        if job:
                            job.progress = int((end_idx / total_rows) * 100)
                except Exception as e:
                    print(f"Error in chunk {chunk_idx}: {e}")
                    import traceback
                    traceback.print_exc()
                    raise
        else:
            print(f"Processing without chunking (total_rows: {total_rows})")
            try:
                results, stats = self._compare_chunk(
                    df_a_indexed,
                    df_b_indexed,
                    columns,  # UI IMPROVEMENT: Pass as comparison_columns
                    all_display_columns,  # UI IMPROVEMENT: Pass all columns for display
                    use_index,
                    keyword_filter
                )
                matching = stats["matching"]
                mismatching = stats["mismatching"]
                only_in_a = stats["only_in_a"]
                only_in_b = stats["only_in_b"]
            except Exception as e:
                print(f"Error in comparison: {e}")
                import traceback
                traceback.print_exc()
                raise
        
        summary = {
            "total_a": len(df_a),
            "total_b": len(df_b),
            "matching": matching,
            "mismatching": mismatching,
            "only_in_a": only_in_a,
            "only_in_b": only_in_b
        }
        
        result = {
            "summary": summary,
            "results": results,
            "columns_compared": columns
        }
        
        if job_id:
            job = self.jobs.get(job_id)
            if job:
                job.status = "completed"
                job.progress = 100
                job.result = result
                job.completed_at = datetime.now()
        
        return result
    
    def _compare_chunk(
        self,
        df_a_chunk: pd.DataFrame,
        df_b_chunk: pd.DataFrame,
        comparison_columns: List[str],  # UI IMPROVEMENT: Columns used for comparison
        all_display_columns: List[str],  # UI IMPROVEMENT: All columns to include in row data
        use_index: bool,
        keyword_filter: Optional[str] = None
    ) -> Tuple[List[Dict], Dict[str, int]]:
        """Compare a chunk of data."""
        results = []
        matching = 0
        mismatching = 0
        only_in_a = 0
        only_in_b = 0
        
        # C: Rewrite _compare_chunk to use vectorized merge
        # Copy and drop duplicates to avoid merge explosion
        df_a_temp = df_a_chunk.copy()
        df_b_temp = df_b_chunk.copy()
        
        df_a_temp['_idx'] = df_a_temp.index
        df_b_temp['_idx'] = df_b_temp.index
        
        df_a_temp = df_a_temp.drop_duplicates(subset=['_idx'])
        df_b_temp = df_b_temp.drop_duplicates(subset=['_idx'])
        
        # Merge using outer join
        merged = pd.merge(df_a_temp, df_b_temp, on='_idx', how='outer', indicator=True, suffixes=('_a', '_b'))
        merged = merged.rename(columns={'_merge': 'merge_indicator'})
        
        def get_row_key(row_dict, in_a, in_b):
            prefix = '_a' if in_a and not in_b else ('_b' if in_b and not in_a else '_a')
            for id_col in ['ObjectId', 'SystemId', 'id', 'ID', 'name', 'Name']:
                col_name = f"{id_col}{prefix}"
                if col_name in row_dict and pd.notna(row_dict[col_name]):
                    val = str(row_dict[col_name])
                    if len(val) < 50:
                        return val
            idx_val = row_dict['_idx']
            if isinstance(idx_val, tuple) and len(idx_val) > 0:
                return str(idx_val[0]) if len(str(idx_val[0])) < 50 else f"row_{hash(str(idx_val)) % 10000}"
            else:
                return str(idx_val) if len(str(idx_val)) < 50 else f"row_{hash(str(idx_val)) % 10000}"

        # Vectorized simple equality check for matched rows ('both')
        # We can pre-calculate the simple equality mask for comparison columns
        # To handle NaN == NaN in pandas, we use .equals or (a == b) | (a.isna() & b.isna())
        
        # Process the merged dataframe
        for row_tuple in merged.itertuples(index=False):
            row = row_tuple._asdict()
            merge_status = row['merge_indicator']
            
            if merge_status == 'left_only':
                only_in_a += 1
                row_key = get_row_key(row, True, False)
                row_data = {}
                for col in all_display_columns:
                    col_a = f"{col}_a" if f"{col}_a" in row else col
                    if col_a in row and pd.notna(row[col_a]):
                        row_data[col] = self._convert_to_json_format(row[col_a])
                results.append({
                    "row_key": row_key,
                    "status": "only_in_a",
                    "differences": [],
                    "row_data_a": row_data,
                    "row_data_b": None
                })
            elif merge_status == 'right_only':
                only_in_b += 1
                row_key = get_row_key(row, False, True)
                row_data = {}
                for col in all_display_columns:
                    col_b = f"{col}_b" if f"{col}_b" in row else col
                    if col_b in row and pd.notna(row[col_b]):
                        row_data[col] = self._convert_to_json_format(row[col_b])
                results.append({
                    "row_key": row_key,
                    "status": "only_in_b",
                    "differences": [],
                    "row_data_a": None,
                    "row_data_b": row_data
                })
            else:
                # 'both'
                row_key = get_row_key(row, True, True)
                differences = []
                
                # Apply keyword filter
                if keyword_filter:
                    found = False
                    for col in comparison_columns:
                        col_a = f"{col}_a" if f"{col}_a" in row else col
                        col_b = f"{col}_b" if f"{col}_b" in row else col
                        val_a_str = str(row[col_a]) if col_a in row and pd.notna(row[col_a]) else ""
                        val_b_str = str(row[col_b]) if col_b in row and pd.notna(row[col_b]) else ""
                        if keyword_filter in val_a_str and keyword_filter in val_b_str:
                            found = True
                            break
                    if not found:
                        continue
                
                for col in comparison_columns:
                    col_a = f"{col}_a" if f"{col}_a" in row else col
                    col_b = f"{col}_b" if f"{col}_b" in row else col
                    
                    if col_a not in row or col_b not in row:
                        continue
                        
                    val_a = row[col_a]
                    val_b = row[col_b]
                    
                    is_na_a = (isinstance(val_a, float) and pd.isna(val_a)) or val_a is None
                    is_na_b = (isinstance(val_b, float) and pd.isna(val_b)) or val_b is None
                    
                    if is_na_a and is_na_b:
                        continue
                    
                    # 3. Simple equality check first
                    if val_a == val_b:
                        continue
                        
                    # 4. Only run expensive JSON comparison on rows that fail simple equality
                    norm_a = normalize_value(val_a)
                    norm_b = normalize_value(val_b)
                    
                    if not compare_json_objects(norm_a, norm_b, _is_normalized=True):
                        json_diffs = get_json_differences(norm_a, norm_b, _is_normalized=True)
                        actual_diffs = [d for d in json_diffs if "differs" in d or "Values differ" in d]
                        if actual_diffs:
                            differences.append({
                                "column": col,
                                "value_a": str(val_a) if not is_na_a else "null",
                                "value_b": str(val_b) if not is_na_b else "null",
                                "diff_keys": json_diffs
                            })
                
                if differences:
                    mismatching += 1
                    row_data_a = {}
                    row_data_b = {}
                    for col in all_display_columns:
                        col_a = f"{col}_a" if f"{col}_a" in row else col
                        col_b = f"{col}_b" if f"{col}_b" in row else col
                        if col_a in row and pd.notna(row[col_a]):
                            row_data_a[col] = self._convert_to_json_format(row[col_a])
                        if col_b in row and pd.notna(row[col_b]):
                            row_data_b[col] = self._convert_to_json_format(row[col_b])
                            
                    results.append({
                        "row_key": row_key,
                        "status": "mismatch",
                        "differences": differences,
                        "row_data_a": row_data_a,
                        "row_data_b": row_data_b
                    })
                else:
                    matching += 1
                    # G. Don't return full row data for matching rows
                    results.append({
                        "row_key": row_key,
                        "status": "match",
                        "differences": [],
                        "row_data_a": {},
                        "row_data_b": {}
                    })
        
        stats = {
            "matching": matching,
            "mismatching": mismatching,
            "only_in_a": only_in_a,
            "only_in_b": only_in_b
        }
        
        return results, stats
    
    def _get_json_diff_keys(self, val_a: Any, val_b: Any) -> List[str]:
        """Identify which keys differ between two JSON values."""
        try:
            norm_a = normalize_value(val_a)
            norm_b = normalize_value(val_b)
            
            if isinstance(norm_a, dict) and isinstance(norm_b, dict):
                all_keys = set(norm_a.keys()) | set(norm_b.keys())
                diff_keys = []
                for key in all_keys:
                    if norm_a.get(key) != norm_b.get(key):
                        diff_keys.append(key)
                return diff_keys
        except:
            pass
        
        return []
    
    def _convert_to_json_format(self, value) -> str:
        """Convert tuple/list representation to JSON format."""
        import json
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return "null"
        if isinstance(value, dict):
            return json.dumps(value, indent=2, default=str)
        if isinstance(value, (list, tuple)):
            return json.dumps(value, indent=2, default=str)
        val_str = str(value)
        try:
            parsed = json.loads(val_str)
            if isinstance(parsed, (dict, list)):
                return json.dumps(parsed, indent=2, default=str)
        except (json.JSONDecodeError, ValueError):
            pass
        return val_str
    
    def _compare_content_based(
        self,
        df_a: pd.DataFrame,
        df_b: pd.DataFrame,
        columns: List[str],
        all_display_columns: List[str],  # UI IMPROVEMENT: All columns to include in row data
        keyword_filter: Optional[str] = None
    ) -> Tuple[List[Dict], Dict[str, int]]:
        """
        Compare rows based on content matching - find rows with same values.
        This matches rows where ALL selected column values are equal, regardless of row order.
        """
        results = []
        matching = 0
        mismatching = 0
        only_in_a = 0
        only_in_b = 0
        
        def create_content_hash(row, cols):
            """Create a hash key from row values for the specified columns."""
            hash_parts = []
            for col in cols:
                if col in row:
                    val = ensure_scalar(row[col])
                    # Normalize the value for consistent hashing
                    normalized = normalize_value(val)
                    hash_parts.append(str(normalized))
                else:
                    hash_parts.append("")
            return tuple(hash_parts)
        
        # Build lookup from File B - first match only
        b_content_map = {}  # hash -> (idx, row)
        b_matched_hashes = set()
        
        for idx_b, row_tuple in enumerate(df_b.itertuples(index=False)):
            row_b = row_tuple._asdict()
            hash_key = create_content_hash(row_b, columns)
            if hash_key not in b_content_map:  # First match only
                b_content_map[hash_key] = (idx_b, row_b)
        
        # Match rows from File A
        a_matched_hashes = set()
        for idx_a, row_tuple in enumerate(df_a.itertuples(index=False)):
            row_a = row_tuple._asdict()
            hash_key = create_content_hash(row_a, columns)
            
            # Apply keyword filter if specified
            if keyword_filter:
                row_str = ' '.join(str(row_a[col]) for col in columns if col in row_a)
                if keyword_filter not in row_str:
                    continue
            
            if hash_key in b_content_map and hash_key not in a_matched_hashes:
                idx_b, row_b = b_content_map[hash_key]
                b_matched_hashes.add(hash_key)
                a_matched_hashes.add(hash_key)
                
                # Rows match based on content
                matching += 1
                
                # UI IMPROVEMENT: Don't return full row data for matched
                results.append({
                    "row_key": f"row_{idx_a}",
                    "status": "match",
                    "differences": [],
                    "row_data_a": {},
                    "row_data_b": {}
                })
            else:
                # Row only in A (no matching content in B)
                only_in_a += 1
                
                # UI IMPROVEMENT: Build row data (use all_display_columns)
                row_data_a = {}
                for col in all_display_columns:
                    if col in row_a:
                        val = ensure_scalar(row_a[col])
                        row_data_a[col] = self._convert_to_json_format(val)
                
                results.append({
                    "row_key": f"row_{idx_a}",
                    "status": "only_in_a",
                    "differences": [],
                    "row_data_a": row_data_a,
                    "row_data_b": None
                })
        
        # Find unmatched rows in B
        for hash_key, (idx_b, row_b) in b_content_map.items():
            if hash_key not in b_matched_hashes:
                # Apply keyword filter if specified
                if keyword_filter:
                    row_str = ' '.join(str(row_b[col]) for col in columns if col in row_b)
                    if keyword_filter not in row_str:
                        continue
                
                only_in_b += 1
                
                # UI IMPROVEMENT: Build row data (use all_display_columns)
                row_data_b = {}
                for col in all_display_columns:
                    if col in row_b:
                        val = ensure_scalar(row_b[col])
                        row_data_b[col] = self._convert_to_json_format(val)
                
                results.append({
                    "row_key": f"row_{idx_b}",
                    "status": "only_in_b",
                    "differences": [],
                    "row_data_a": None,
                    "row_data_b": row_data_b
                })
        
        stats = {
            "matching": matching,
            "mismatching": mismatching,
            "only_in_a": only_in_a,
            "only_in_b": only_in_b
        }
        
        return results, stats
    
    def _apply_filters(self, df: pd.DataFrame, filters: List[Dict]) -> pd.DataFrame:
        """
        Apply row-level filters to a DataFrame using OR logic.
        
        Rows are included if they match ANY of the filters (OR logic).
        This allows selecting multiple values for the same column.
        """
        if not filters or len(df) == 0:
            return df
        
        # Initialize combined mask as all False
        combined_mask = pd.Series([False] * len(df), index=df.index)
        
        for filter_criteria in filters:
            column = filter_criteria.get("column")
            value = filter_criteria.get("value")
            operator = filter_criteria.get("operator", "equals")
            
            if column not in df.columns:
                continue
            
            try:
                col_values = df[column].astype(str)
                filter_value = str(value)
                
                # Get mask for this filter
                mask = self._apply_operator(col_values, operator, filter_value)
                
                # OR logic: combine with previous masks
                combined_mask = combined_mask | mask
                
            except Exception as e:
                print(f"Error applying filter {column} {operator} {value}: {e}")
                continue
        
        # Apply the combined OR mask
        filtered_df = df[combined_mask].copy()
        print(f"Filters applied (OR logic): {len(df)} -> {len(filtered_df)} rows")
        
        return filtered_df
    
    def _apply_operator(self, col_values: pd.Series, operator: str, value: str) -> pd.Series:
        """Apply a comparison operator to a column and return a boolean mask."""
        if operator == "equals":
            return col_values == value
        elif operator == "not_equals":
            return col_values != value
        elif operator == "contains":
            return col_values.str.contains(value, na=False)
        elif operator == "not_contains":
            return ~col_values.str.contains(value, na=False)
        elif operator == "greater_than":
            try:
                return pd.to_numeric(col_values, errors='coerce') > float(value)
            except:
                return col_values > value
        elif operator == "less_than":
            try:
                return pd.to_numeric(col_values, errors='coerce') < float(value)
            except:
                return col_values < value
        elif operator == "greater_equal":
            try:
                return pd.to_numeric(col_values, errors='coerce') >= float(value)
            except:
                return col_values >= value
        elif operator == "less_equal":
            try:
                return pd.to_numeric(col_values, errors='coerce') <= float(value)
            except:
                return col_values <= value
        elif operator == "starts_with":
            return col_values.str.startswith(value, na=False)
        elif operator == "ends_with":
            return col_values.str.endswith(value, na=False)
        else:
            # Default to equals
            return col_values == value


# Global comparison engine instance
comparison_engine = ComparisonEngine()
