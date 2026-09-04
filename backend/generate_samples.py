import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path


def generate_sample_data():
    """Generate sample parquet files for testing."""
    
    sample_dir = Path(__file__).parent / "sample_data"
    sample_dir.mkdir(exist_ok=True)
    
    # Sample data with JSON properties (different key orders)
    data_a = [
        {
            "ObjectId": "obj1",
            "SystemId": "sys1",
            "properties": {
                "tag": "34",
                "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
                "rule.trigger": "denied",
                "rule.filter": "900"
            },
            "name": "Item 1",
            "value": 100
        },
        {
            "ObjectId": "obj2",
            "SystemId": "sys2",
            "properties": {
                "tag": "35",
                "schedule-pattern": "1769631302|every 2 days at 1:00 PM",
                "rule.trigger": "allowed",
                "rule.filter": "901"
            },
            "name": "Item 2",
            "value": 200
        },
        {
            "ObjectId": "obj3",
            "SystemId": "sys3",
            "properties": {
                "tag": "36",
                "schedule-pattern": "1769631303|every 3 days at 2:00 PM",
                "rule.trigger": "denied",
                "rule.filter": "902"
            },
            "name": "Item 3",
            "value": 300
        },
        {
            "ObjectId": "obj4",
            "SystemId": "sys4",
            "properties": {
                "tag": "37",
                "schedule-pattern": "1769631304|every 4 days at 3:00 PM",
                "rule.trigger": "allowed",
                "rule.filter": "903"
            },
            "name": "Item 4",
            "value": 400
        },
        {
            "ObjectId": "obj5",
            "SystemId": "sys5",
            "properties": {
                "tag": "38",
                "schedule-pattern": "1769631305|every 5 days at 4:00 PM",
                "rule.trigger": "denied",
                "rule.filter": "904"
            },
            "name": "Item 5",
            "value": 500
        }
    ]
    
    # Same data but with shuffled key order in properties + one mismatched row
    data_b = [
        {
            "ObjectId": "obj1",
            "SystemId": "sys1",
            "properties": {
                "rule.trigger": "denied",
                "rule.filter": "900",
                "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
                "tag": "34"
            },
            "name": "Item 1",
            "value": 100
        },
        {
            "ObjectId": "obj2",
            "SystemId": "sys2",
            "properties": {
                "rule.filter": "901",
                "tag": "35",
                "rule.trigger": "allowed",
                "schedule-pattern": "1769631302|every 2 days at 1:00 PM"
            },
            "name": "Item 2",
            "value": 200
        },
        {
            "ObjectId": "obj3",
            "SystemId": "sys3",
            "properties": {
                "schedule-pattern": "1769631303|every 3 days at 2:00 PM",
                "rule.trigger": "denied",
                "tag": "36",
                "rule.filter": "902"
            },
            "name": "Item 3",
            "value": 300
        },
        {
            "ObjectId": "obj4",
            "SystemId": "sys4",
            "properties": {
                "tag": "37",
                "rule.filter": "903",
                "rule.trigger": "allowed",
                "schedule-pattern": "1769631304|every 4 days at 3:00 PM"
            },
            "name": "Item 4",
            "value": 400
        },
        {
            "ObjectId": "obj5",
            "SystemId": "sys5",
            "properties": {
                "rule.trigger": "denied",
                "tag": "38",
                "schedule-pattern": "1769631305|every 5 days at 4:00 PM",
                "rule.filter": "999"  # INTENTIONALLY DIFFERENT
            },
            "name": "Item 5",
            "value": 500
        }
    ]
    
    # Create DataFrames
    df_a = pd.DataFrame(data_a)
    df_b = pd.DataFrame(data_b)
    
    # Convert to PyArrow tables and save as Parquet
    table_a = pa.Table.from_pandas(df_a)
    table_b = pa.Table.from_pandas(df_b)
    
    pq.write_table(table_a, sample_dir / "sample_a.parquet")
    pq.write_table(table_b, sample_dir / "sample_b.parquet")
    
    print(f"Generated sample files:")
    print(f"  {sample_dir / 'sample_a.parquet'} ({len(df_a)} rows)")
    print(f"  {sample_dir / 'sample_b.parquet'} ({len(df_b)} rows)")
    print(f"\nExpected comparison results:")
    print(f"  - 4 matching rows (obj1-obj4)")
    print(f"  - 1 mismatching row (obj5 - different rule.filter value)")
    print(f"  - 0 rows only in A")
    print(f"  - 0 rows only in B")


if __name__ == "__main__":
    generate_sample_data()
