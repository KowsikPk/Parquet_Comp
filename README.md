# Parquet File Comparison Web Application

A full-stack web application that allows users to upload two Apache Parquet files and compare them with JSON-aware deep comparison logic.

## Features

- **File Upload**: Upload two Parquet files via drag-and-drop or file selection
- **Column Selection**: Compare all columns or select specific columns for comparison
- **Row Matching**: Match rows by key columns (e.g., ObjectId) or by row index
- **JSON-Aware Comparison**: Deep comparison that handles JSON columns with different key orders
- **Detailed Results**: View matching/mismatching rows with expandable details
- **Export**: Download comparison results as CSV reports
- **Sample Data**: Load sample Parquet files for testing

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI (Python) + PyArrow + pandas
- **Comparison**: Custom JSON normalization for semantic comparison

## Project Structure

```
Parquet_Comp/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── models.py               # Pydantic models
│   ├── comparison.py           # Comparison engine
│   ├── json_normalizer.py      # JSON normalization helpers
│   ├── file_handler.py         # File upload/caching logic
│   ├── generate_samples.py     # Sample data generator
│   ├── sample_data/            # Sample Parquet files
│   ├── requirements.txt        # Python dependencies
│   └── tests/                  # Backend tests
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   ├── services/           # API service
    │   ├── types/              # TypeScript types
    │   ├── App.tsx             # Main application
    │   └── main.tsx            # Entry point
    ├── package.json            # Node dependencies
    └── vite.config.ts          # Vite configuration
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running Tests

### Backend Tests

Run the pytest test suite:
```bash
cd backend
python -m pytest tests/ -v
```

The tests cover:
- JSON normalization functions
- Comparison engine logic
- Row matching strategies
- In-memory Parquet file handling

## API Endpoints

- `POST /upload` - Upload two Parquet files
- `POST /compare` - Compare uploaded files
- `GET /compare/status/{job_id}` - Get comparison job status
- `GET /compare/result/{job_id}` - Get comparison results
- `GET /report/{job_id}` - Download CSV report
- `GET /load-samples` - Load sample Parquet files
- `GET /health` - Health check

## JSON Comparison Logic

The application uses a deep normalization approach for JSON comparison:

1. **Key Sorting**: All dictionary keys are sorted alphabetically at every nesting level
2. **List Sorting**: List elements are sorted if they contain only primitives
3. **String Parsing**: JSON strings are parsed and normalized
4. **Whitespace Handling**: Leading/trailing whitespace is stripped from strings
5. **Null Handling**: null/None values are treated consistently

This ensures that JSON objects with different key orders are correctly identified as equal if their content is the same.

## Example

The following two JSON objects are correctly identified as equal:

```json
// File A
{
  "tag": "34",
  "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
  "rule.trigger": "denied",
  "rule.filter": "900"
}

// File B (different key order)
{
  "rule.trigger": "denied",
  "rule.filter": "900",
  "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
  "tag": "34"
}
```

## Performance Considerations

- Files larger than 100k rows are processed in chunks of 10,000 rows
- Progress tracking is available for long-running comparisons
- Uploaded files are cached in temp directory and cleaned up after 1 hour
- Maximum file size: 500MB per file

## Error Handling

The application handles various error states:
- Wrong file type (must be .parquet)
- File too large (>500MB)
- Parse errors
- Invalid comparison parameters
