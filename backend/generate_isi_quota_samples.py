import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path


def generate_isi_quota_samples():
    """Generate sample parquet files with isi_quota schema for testing."""
    
    sample_dir = Path(__file__).parent / "sample_data"
    sample_dir.mkdir(exist_ok=True)
    
    # Sample data with isi_quota schema
    data_a = [
        {
            "SystemId": "0007430a6b5c129cfa52d717e30bc6e55c8a",
            "ServiceTag": "0007430a6b5c129cfa52d717e30bc6e55c8a",
            "CollectionTimestamp": "1780887604000",
            "CollectionTimesUtc": "2026-06-08T03:00:04.000Z",
            "FileInstanceId": "local/isi_quota",
            "FileName": "local/isi_quota",
            "ObjectClass": "isi_quota",
            "ObjectId": "isi_quota__0x0000000159c4a9bb",
            "properties": {
                "domain.lin": "0x0000000159c4a9bb",
                "domain.snaps": "0",
                "reduction": "1.59 : 1",
                "efficiency": "0.85 : 1",
                "path": "/ifs/data/x200/smb/smbdatagate/path/VitalImage",
                "notifications.use": "global",
                "enforcements.default-resource": "logical",
                "domain.type": "ALL",
                "enforcement.limit": "2199023255552",
                "enforcement.type": "hard",
                "enforcement.resource": "logical",
                "usage.resource.physical": "2458098012160",
                "usage.resource.logical": "2093586819493",
                "usage.resource.inodes": "3293508",
                "usage.resource.applogical": "2079555246179",
                "usage.resource.shadow_refs": "0",
                "usage.resource.physical_data": "1314086420480",
                "usage.resource.physical_protection": "1030853419008"
            },
            "propertiesStr": None
        },
        {
            "SystemId": "0007430a6b5c129cfa52d717e30bc6e55c8b",
            "ServiceTag": "0007430a6b5c129cfa52d717e30bc6e55c8b",
            "CollectionTimestamp": "1780887604001",
            "CollectionTimesUtc": "2026-06-08T03:00:05.000Z",
            "FileInstanceId": "local/isi_quota",
            "FileName": "local/isi_quota",
            "ObjectClass": "isi_quota",
            "ObjectId": "isi_quota__0x0000000159c4a9bc",
            "properties": {
                "domain.lin": "0x0000000159c4a9bc",
                "domain.snaps": "1",
                "reduction": "2.00 : 1",
                "efficiency": "0.90 : 1",
                "path": "/ifs/data/x200/smb/smbdatagate/path/AnotherPath",
                "notifications.use": "local",
                "enforcements.default-resource": "physical",
                "domain.type": "USER",
                "enforcement.limit": "1099511627776",
                "enforcement.type": "soft",
                "enforcement.resource": "physical",
                "usage.resource.physical": "1229049006080",
                "usage.resource.logical": "1046793409746",
                "usage.resource.inodes": "1646754",
                "usage.resource.applogical": "1039777623089",
                "usage.resource.shadow_refs": "1",
                "usage.resource.physical_data": "657043210240",
                "usage.resource.physical_protection": "515426709504"
            },
            "propertiesStr": None
        },
        {
            "SystemId": "0007430a6b5c129cfa52d717e30bc6e55c8c",
            "ServiceTag": "0007430a6b5c129cfa52d717e30bc6e55c8c",
            "CollectionTimestamp": "1780887604002",
            "CollectionTimesUtc": "2026-06-08T03:00:06.000Z",
            "FileInstanceId": "local/another_class",
            "FileName": "local/another_class",
            "ObjectClass": "another_class",  # Different object class
            "ObjectId": "another_class__0x0000000159c4a9bd",
            "properties": {
                "some.property": "value1",
                "another.property": "value2"
            },
            "propertiesStr": None
        }
    ]
    
    # Same data but with some differences
    data_b = [
        {
            "SystemId": "0007430a6b5c129cfa52d717e30bc6e55c8a",
            "ServiceTag": "0007430a6b5c129cfa52d717e30bc6e55c8a",
            "CollectionTimestamp": "1780887604000",
            "CollectionTimesUtc": "2026-06-08T03:00:04.000Z",
            "FileInstanceId": "local/isi_quota",
            "FileName": "local/isi_quota",
            "ObjectClass": "isi_quota",
            "ObjectId": "isi_quota__0x0000000159c4a9bb",
            "properties": {
                "domain.lin": "0x0000000159c4a9bb",
                "domain.snaps": "0",
                "reduction": "1.59 : 1",
                "efficiency": "0.85 : 1",
                "path": "/ifs/data/x200/smb/smbdatagate/path/VitalImage",
                "notifications.use": "global",
                "enforcements.default-resource": "logical",
                "domain.type": "ALL",
                "enforcement.limit": "2199023255552",
                "enforcement.type": "hard",
                "enforcement.resource": "logical",
                "usage.resource.physical": "2458098012160",
                "usage.resource.logical": "2093586819493",
                "usage.resource.inodes": "3293508",
                "usage.resource.applogical": "2079555246179",
                "usage.resource.shadow_refs": "0",
                "usage.resource.physical_data": "1314086420480",
                "usage.resource.physical_protection": "1030853419008"
            },
            "propertiesStr": None
        },
        {
            "SystemId": "0007430a6b5c129cfa52d717e30bc6e55c8b",
            "ServiceTag": "0007430a6b5c129cfa52d717e30bc6e55c8b",
            "CollectionTimestamp": "1780887604001",
            "CollectionTimesUtc": "2026-06-08T03:00:05.000Z",
            "FileInstanceId": "local/isi_quota",
            "FileName": "local/isi_quota",
            "ObjectClass": "isi_quota",
            "ObjectId": "isi_quota__0x0000000159c4a9bc",
            "properties": {
                "domain.lin": "0x0000000159c4a9bc",
                "domain.snaps": "1",
                "reduction": "2.00 : 1",
                "efficiency": "0.90 : 1",
                "path": "/ifs/data/x200/smb/smbdatagate/path/AnotherPath",
                "notifications.use": "local",
                "enforcements.default-resource": "physical",
                "domain.type": "USER",
                "enforcement.limit": "1099511627776",
                "enforcement.type": "soft",
                "enforcement.resource": "physical",
                "usage.resource.physical": "1229049006080",
                "usage.resource.logical": "1046793409746",
                "usage.resource.inodes": "1646754",
                "usage.resource.applogical": "1039777623089",
                "usage.resource.shadow_refs": "1",
                "usage.resource.physical_data": "657043210240",
                "usage.resource.physical_protection": "515426709504"
            },
            "propertiesStr": None
        },
        {
            "SystemId": "0007430a6b5c129cfa52d717e30bc6e55c8c",
            "ServiceTag": "0007430a6b5c129cfa52d717e30bc6e55c8c",
            "CollectionTimestamp": "1780887604002",
            "CollectionTimesUtc": "2026-06-08T03:00:06.000Z",
            "FileInstanceId": "local/another_class",
            "FileName": "local/another_class",
            "ObjectClass": "another_class",
            "ObjectId": "another_class__0x0000000159c4a9bd",
            "properties": {
                "some.property": "value1",
                "another.property": "different_value"  # INTENTIONALLY DIFFERENT
            },
            "propertiesStr": None
        }
    ]
    
    # Create DataFrames
    df_a = pd.DataFrame(data_a)
    df_b = pd.DataFrame(data_b)
    
    # Convert to PyArrow tables and save as Parquet
    table_a = pa.Table.from_pandas(df_a)
    table_b = pa.Table.from_pandas(df_b)
    
    pq.write_table(table_a, sample_dir / "isi_quota_a.parquet")
    pq.write_table(table_b, sample_dir / "isi_quota_b.parquet")
    
    print(f"Generated isi_quota sample files:")
    print(f"  {sample_dir / 'isi_quota_a.parquet'} ({len(df_a)} rows)")
    print(f"  {sample_dir / 'isi_quota_b.parquet'} ({len(df_b)} rows)")
    print(f"\nSchema includes: SystemId, ServiceTag, ObjectClass, ObjectId, properties, etc.")
    print(f"ObjectClass values: isi_quota (2 rows), another_class (1 row)")
    print(f"\nExpected comparison results (no filters):")
    print(f"  - 2 matching rows (isi_quota objects)")
    print(f"  - 1 mismatching row (another_class with different property value)")
    print(f"\nExpected comparison results (ObjectClass = isi_quota filter):")
    print(f"  - 2 matching rows (only isi_quota objects)")
    print(f"  - 0 mismatching rows")


if __name__ == "__main__":
    generate_isi_quota_samples()
