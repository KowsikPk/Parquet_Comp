import pytest
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import io
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from comparison import comparison_engine
from json_normalizer import values_are_equal


def create_in_memory_parquet(df):
    """Create an in-memory parquet file from a DataFrame."""
    table = pa.Table.from_pandas(df)
    buffer = io.BytesIO()
    pq.write_table(table, buffer)
    buffer.seek(0)
    return buffer.getvalue()


class TestComparisonEngine:
    def test_compare_identical_dataframes(self):
        """Test that identical dataframes are reported as matching."""
        data = [
            {"ObjectId": "obj1", "name": "Item 1", "value": 100},
            {"ObjectId": "obj2", "name": "Item 2", "value": 200}
        ]
        df_a = pd.DataFrame(data)
        df_b = pd.DataFrame(data)

        result = comparison_engine.compare_dataframes(df_a, df_b)

        assert result["summary"]["matching"] == 2
        assert result["summary"]["mismatching"] == 0
        assert result["summary"]["only_in_a"] == 0
        assert result["summary"]["only_in_b"] == 0

    def test_compare_with_different_values(self):
        """Test that different values are reported as partial matches if some columns still match."""
        data_a = [
            {"ObjectId": "obj1", "name": "Item 1", "value": 100},
            {"ObjectId": "obj2", "name": "Item 2", "value": 200}
        ]
        data_b = [
            {"ObjectId": "obj1", "name": "Item 1", "value": 100},
            {"ObjectId": "obj2", "name": "Item 2", "value": 999}  # Different
        ]
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)

        result = comparison_engine.compare_dataframes(df_a, df_b)

        assert result["summary"]["matching"] == 1
        assert result["summary"]["partial_match"] == 1
        assert result["summary"]["only_in_a"] == 0
        assert result["summary"]["only_in_b"] == 0

    def test_compare_with_json_columns(self):
        """Test comparison with JSON columns having different key order."""
        data_a = [
            {
                "ObjectId": "obj1",
                "properties": {
                    "tag": "34",
                    "rule.trigger": "denied",
                    "rule.filter": "900"
                }
            }
        ]
        data_b = [
            {
                "ObjectId": "obj1",
                "properties": {
                    "rule.trigger": "denied",
                    "rule.filter": "900",
                    "tag": "34"
                }
            }
        ]
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)

        result = comparison_engine.compare_dataframes(df_a, df_b)

        # Should match because JSON comparison is key-order-insensitive
        assert result["summary"]["matching"] == 1
        assert result["summary"]["mismatching"] == 0

    def test_compare_with_different_row_counts(self):
        """Test comparison when dataframes have different row counts."""
        data_a = [
            {"ObjectId": "obj1", "name": "Item 1"},
            {"ObjectId": "obj2", "name": "Item 2"}
        ]
        data_b = [
            {"ObjectId": "obj1", "name": "Item 1"}
        ]
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)

        result = comparison_engine.compare_dataframes(df_a, df_b)

        assert result["summary"]["matching"] == 1
        assert result["summary"]["only_in_a"] == 1
        assert result["summary"]["only_in_b"] == 0

    def test_compare_with_join_keys(self):
        """Test comparison using join keys instead of row index."""
        data_a = [
            {"ObjectId": "obj1", "name": "Item 1"},
            {"ObjectId": "obj2", "name": "Item 2"}
        ]
        data_b = [
            {"ObjectId": "obj2", "name": "Item 2"},  # Different order
            {"ObjectId": "obj1", "name": "Item 1"}
        ]
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)

        # Without join keys (row index), this would show mismatches
        result_index = comparison_engine.compare_dataframes(df_a, df_b, join_keys=None)
        assert result_index["summary"]["mismatching"] > 0

        # With join keys, should match
        result_join = comparison_engine.compare_dataframes(df_a, df_b, join_keys=["ObjectId"])
        assert result_join["summary"]["matching"] == 2
        assert result_join["summary"]["mismatching"] == 0

    def test_compare_specific_columns(self):
        """Test comparison with specific column selection."""
        data_a = [
            {"ObjectId": "obj1", "name": "Item 1", "value": 100},
            {"ObjectId": "obj2", "name": "Item 2", "value": 200}
        ]
        data_b = [
            {"ObjectId": "obj1", "name": "Item 1", "value": 999},  # Different value
            {"ObjectId": "obj2", "name": "Item 2", "value": 200}
        ]
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)

        # Compare all columns - should have partial_match since other cols match
        result_all = comparison_engine.compare_dataframes(df_a, df_b, columns=None)
        assert result_all["summary"]["partial_match"] == 1

        # Compare only name column - should match
        result_specific = comparison_engine.compare_dataframes(df_a, df_b, columns=["name"])
        assert result_specific["summary"]["matching"] == 2
        assert result_specific["summary"]["mismatching"] == 0

    def test_chunked_processing(self):
        """Test that chunked processing works for large datasets."""
        # Create a dataset larger than chunk_size (10000)
        chunk_size = 10
        data_a = [{"ObjectId": f"obj{i}", "value": i} for i in range(25)]
        data_b = [{"ObjectId": f"obj{i}", "value": i} for i in range(25)]
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)

        result = comparison_engine.compare_dataframes(
            df_a, df_b, chunk_size=chunk_size
        )

        assert result["summary"]["matching"] == 25
        assert result["summary"]["mismatching"] == 0

    def test_job_creation_and_status(self):
        """Test job creation and status tracking."""
        job_id = comparison_engine.create_job()
        
        status = comparison_engine.get_job_status(job_id)
        assert status is not None
        assert status["job_id"] == job_id
        assert status["status"] == "pending"
        assert status["progress"] == 0

    def test_job_progress_tracking(self):
        """Test that job progress is tracked correctly."""
        job_id = comparison_engine.create_job()
        
        # Create a small dataset for quick processing
        data = [{"ObjectId": "obj1", "value": 1}]
        df_a = pd.DataFrame(data)
        df_b = pd.DataFrame(data)
        
        comparison_engine.compare_dataframes(df_a, df_b, job_id=job_id)
        
        status = comparison_engine.get_job_status(job_id)
        assert status["status"] == "completed"
        assert status["progress"] == 100


class TestInMemoryParquet:
    def test_create_and_read_in_memory_parquet(self):
        """Test creating and reading in-memory parquet files."""
        data = [
            {"ObjectId": "obj1", "name": "Item 1", "value": 100},
            {"ObjectId": "obj2", "name": "Item 2", "value": 200}
        ]
        df = pd.DataFrame(data)
        
        # Create in-memory parquet
        parquet_bytes = create_in_memory_parquet(df)
        
        # Read it back
        buffer = io.BytesIO(parquet_bytes)
        table = pq.read_table(buffer)
        df_read = table.to_pandas()
        
        assert len(df_read) == 2
        assert list(df_read.columns) == ["ObjectId", "name", "value"]
        assert df_read.iloc[0]["ObjectId"] == "obj1"

    def test_comparison_with_in_memory_parquet(self):
        """Test full comparison workflow with in-memory parquet files."""
        data_a = [
            {
                "ObjectId": "obj1",
                "properties": {
                    "tag": "34",
                    "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
                    "rule.trigger": "denied",
                    "rule.filter": "900"
                }
            }
        ]
        data_b = [
            {
                "ObjectId": "obj1",
                "properties": {
                    "rule.trigger": "denied",
                    "rule.filter": "900",
                    "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
                    "tag": "34"
                }
            }
        ]
        
        df_a = pd.DataFrame(data_a)
        df_b = pd.DataFrame(data_b)
        
        result = comparison_engine.compare_dataframes(df_a, df_b)
        
        # Should match despite different key order in JSON
        assert result["summary"]["matching"] == 1
        assert result["summary"]["mismatching"] == 0