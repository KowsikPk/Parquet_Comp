import os
import uuid
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
import pyarrow.parquet as pq
import pandas as pd


class FileHandler:
    def __init__(self, cache_dir: str = None):
        if cache_dir is None:
            # Use temp directory that works on both Windows and Unix
            import tempfile
            cache_dir = str(Path(tempfile.gettempdir()) / "parquet_compare")
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.file_metadata: Dict[str, Dict] = {}
        
    def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file and return file_id."""
        file_id = str(uuid.uuid4())
        file_path = self.cache_dir / f"{file_id}.parquet"
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Read metadata
        try:
            parquet_file = pq.ParquetFile(file_path)
            
            self.file_metadata[file_id] = {
                "file_path": str(file_path),
                "original_filename": filename,
                "row_count": parquet_file.metadata.num_rows,
                "columns": parquet_file.schema_arrow.names,
                "file_size": len(file_content),
                "uploaded_at": datetime.now(),
                "expires_at": datetime.now() + timedelta(hours=1)
            }
        except Exception as e:
            # Clean up file if read fails
            if file_path.exists():
                file_path.unlink()
            raise ValueError(f"Failed to read Parquet file: {str(e)}")
        
        return file_id
    
    def get_file_metadata(self, file_id: str) -> Optional[Dict]:
        """Get metadata for a file_id."""
        return self.file_metadata.get(file_id)
    
    def load_dataframe(self, file_id: str) -> pd.DataFrame:
        """Load DataFrame from file_id."""
        metadata = self.get_file_metadata(file_id)
        if not metadata:
            raise ValueError(f"File ID {file_id} not found")
        
        file_path = Path(metadata["file_path"])
        if not file_path.exists():
            raise ValueError(f"File {file_path} not found")
        
        table = pq.read_table(file_path)
        return table.to_pandas()
    
    def cleanup_expired_files(self):
        """Remove files that have expired."""
        now = datetime.now()
        expired_ids = [
            file_id for file_id, meta in self.file_metadata.items()
            if meta["expires_at"] < now
        ]
        
        for file_id in expired_ids:
            metadata = self.file_metadata[file_id]
            file_path = Path(metadata["file_path"])
            if file_path.exists():
                file_path.unlink()
            del self.file_metadata[file_id]
    
    def delete_file(self, file_id: str):
        """Delete a specific file."""
        metadata = self.file_metadata.get(file_id)
        if metadata:
            file_path = Path(metadata["file_path"])
            if file_path.exists():
                file_path.unlink()
            del self.file_metadata[file_id]


# Global file handler instance
file_handler = FileHandler()
