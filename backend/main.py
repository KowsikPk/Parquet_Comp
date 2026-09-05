from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional
import pandas as pd
import io
import csv
from pathlib import Path

from models import (
    FileUploadResponse, CompareRequest, CompareResponse, JobStatusResponse
)
from file_handler import file_handler
from comparison import comparison_engine

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Clean up expired files on startup."""
    file_handler.cleanup_expired_files()
    yield


app = FastAPI(title="Parquet Comparison API", lifespan=lifespan)

# Configure CORS
# DOCKER: Allow all origins for Docker deployment (Nginx serves frontend and proxies API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Docker deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload", response_model=FileUploadResponse)
async def upload_files(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...)
):
    """Upload two Parquet files for comparison."""
    
    # Validate file types
    if not file_a.filename.endswith('.parquet'):
        raise HTTPException(status_code=400, detail="File A must be a .parquet file")
    if not file_b.filename.endswith('.parquet'):
        raise HTTPException(status_code=400, detail="File B must be a .parquet file")
    
    # Check file sizes (max 500MB)
    MAX_SIZE = 500 * 1024 * 1024  # 500MB
    
    content_a = await file_a.read()
    content_b = await file_b.read()
    
    if len(content_a) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File A exceeds 500MB limit")
    if len(content_b) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File B exceeds 500MB limit")
    
    # Save files
    try:
        file_a_id = file_handler.save_uploaded_file(content_a, file_a.filename)
        file_b_id = file_handler.save_uploaded_file(content_b, file_b.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Get metadata
    file_a_metadata = file_handler.get_file_metadata(file_a_id)
    file_b_metadata = file_handler.get_file_metadata(file_b_id)
    
    return FileUploadResponse(
        file_a_id=file_a_id,
        file_b_id=file_b_id,
        file_a_metadata=file_a_metadata,
        file_b_metadata=file_b_metadata
    )


@app.post("/compare", response_model=CompareResponse)
async def compare_files(request: CompareRequest, background_tasks: BackgroundTasks):
    """Compare two uploaded Parquet files."""
    
    # Load dataframes
    try:
        df_a = file_handler.load_dataframe(request.file_a_id)
        df_b = file_handler.load_dataframe(request.file_b_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Determine if we need async processing (large files)
    total_rows = max(len(df_a), len(df_b))
    use_async = total_rows > 5000
    
    if use_async:
        # Create job and process in background
        job_id = comparison_engine.create_job()
        
        def run_comparison():
            try:
                comparison_engine.compare_dataframes(
                    df_a, df_b,
                    columns=request.columns,
                    display_columns=request.display_columns,  # UI IMPROVEMENT: Pass display_columns
                    join_keys=request.join_keys,
                    keyword_filter=request.keyword_filter,
                    file_a_filters=[f.model_dump() for f in request.file_a_filters] if request.file_a_filters else None,
                    file_b_filters=[f.model_dump() for f in request.file_b_filters] if request.file_b_filters else None,
                    job_id=job_id,
                    matching_strategy=request.matching_strategy
                )
            except Exception as e:
                job = comparison_engine.jobs.get(job_id)
                if job:
                    job.status = "failed"
                    job.error = str(e)
        
        background_tasks.add_task(run_comparison)
        
        return CompareResponse(
            summary=None,
            results=[],
            columns_compared=[],
            job_id=job_id
        )
    else:
        # Process synchronously
        result = comparison_engine.compare_dataframes(
            df_a, df_b,
            columns=request.columns,
            display_columns=request.display_columns,  # UI IMPROVEMENT: Pass display_columns
            join_keys=request.join_keys,
            keyword_filter=request.keyword_filter,
            file_a_filters=[f.model_dump() for f in request.file_a_filters] if request.file_a_filters else None,
            file_b_filters=[f.model_dump() for f in request.file_b_filters] if request.file_b_filters else None,
            matching_strategy=request.matching_strategy
        )
        
        return CompareResponse(
            summary=result["summary"],
            results=result["results"],
            columns_compared=result["columns_compared"],
            job_id=None
        )


@app.get("/compare/status/{job_id}", response_model=JobStatusResponse)
async def get_comparison_status(job_id: str):
    """Get the status of an async comparison job."""
    status = comparison_engine.get_job_status(job_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(**status)


@app.get("/compare/result/{job_id}", response_model=CompareResponse)
async def get_comparison_result(job_id: str):
    """Get the result of a completed comparison job."""
    job = comparison_engine.jobs.get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if not job.result:
        raise HTTPException(status_code=500, detail="Job result not available")
    
    return CompareResponse(
        summary=job.result["summary"],
        results=job.result["results"],
        columns_compared=job.result["columns_compared"],
        job_id=job_id
    )


@app.get("/report/{job_id}")
async def download_report(job_id: str):
    """Download comparison results as CSV."""
    job = comparison_engine.jobs.get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if not job.result:
        raise HTTPException(status_code=500, detail="Job result not available")
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["row_key", "match_status", "mismatched_columns", "file_a_value", "file_b_value"])
    
    # Rows
    for result in job.result["results"]:
        if result["differences"]:
            for diff in result["differences"]:
                writer.writerow([
                    result["row_key"],
                    result["status"],
                    diff["column"],
                    diff["value_a"],
                    diff["value_b"]
                ])
        else:
            writer.writerow([
                result["row_key"],
                result["status"],
                "",
                "",
                ""
            ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=comparison_report_{job_id}.csv"}
    )


@app.get("/load-samples", response_model=FileUploadResponse)
async def load_sample_files():
    """Load sample parquet files for testing."""
    sample_dir = Path(__file__).parent / "sample_data"
    sample_a_path = sample_dir / "sample_a.parquet"
    sample_b_path = sample_dir / "sample_b.parquet"
    
    if not sample_a_path.exists() or not sample_b_path.exists():
        raise HTTPException(status_code=404, detail="Sample files not found")
    
    try:
        with open(sample_a_path, "rb") as f:
            content_a = f.read()
        with open(sample_b_path, "rb") as f:
            content_b = f.read()
        
        file_a_id = file_handler.save_uploaded_file(content_a, "sample_a.parquet")
        file_b_id = file_handler.save_uploaded_file(content_b, "sample_b.parquet")
        
        file_a_metadata = file_handler.get_file_metadata(file_a_id)
        file_b_metadata = file_handler.get_file_metadata(file_b_id)
        
        return FileUploadResponse(
            file_a_id=file_a_id,
            file_b_id=file_b_id,
            file_a_metadata=file_a_metadata,
            file_b_metadata=file_b_metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sample files: {str(e)}")


@app.get("/load-isi-quota-samples", response_model=FileUploadResponse)
async def load_isi_quota_sample_files():
    """Load isi_quota sample parquet files for testing."""
    sample_dir = Path(__file__).parent / "sample_data"
    sample_a_path = sample_dir / "isi_quota_a.parquet"
    sample_b_path = sample_dir / "isi_quota_b.parquet"
    
    if not sample_a_path.exists() or not sample_b_path.exists():
        raise HTTPException(status_code=404, detail="isi_quota sample files not found")
    
    try:
        with open(sample_a_path, "rb") as f:
            content_a = f.read()
        with open(sample_b_path, "rb") as f:
            content_b = f.read()
        
        file_a_id = file_handler.save_uploaded_file(content_a, "isi_quota_a.parquet")
        file_b_id = file_handler.save_uploaded_file(content_b, "isi_quota_b.parquet")
        
        file_a_metadata = file_handler.get_file_metadata(file_a_id)
        file_b_metadata = file_handler.get_file_metadata(file_b_id)
        
        return FileUploadResponse(
            file_a_id=file_a_id,
            file_b_id=file_b_id,
            file_a_metadata=file_a_metadata,
            file_b_metadata=file_b_metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load isi_quota sample files: {str(e)}")


@app.get("/distinct-values/{file_id}/{column}")
async def get_distinct_values(file_id: str, column: str, limit: int = 100, sample_size: int = 10):
    """Get distinct values for a column in a file."""
    metadata = file_handler.get_file_metadata(file_id)
    
    if not metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = Path(metadata["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    try:
        df = pd.read_parquet(file_path, columns=[column])
        
        if column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{column}' not found in file")
        
        # Get distinct values, convert to string, sort, and limit
        distinct_values = df[column].dropna().astype(str).unique().tolist()
        distinct_values.sort()
        total_count = len(distinct_values)
        
        # If too many distinct values, return sample instead
        if total_count > limit:
            # Get random sample of values
            import random
            sample_values = random.sample(distinct_values, min(sample_size, total_count))
            sample_values.sort()
            return {
                "column": column,
                "values": sample_values,
                "total_count": total_count,
                "truncated": True,
                "is_sample": True,
                "sample_size": len(sample_values)
            }
        
        return {
            "column": column,
            "values": distinct_values,
            "total_count": total_count,
            "truncated": False,
            "is_sample": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get distinct values: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    # DOCKER: Run on 127.0.0.1 for Docker (Nginx proxies requests)
    uvicorn.run(app, host="127.0.0.1", port=8000)
