#!/bin/bash

echo "Starting Parquet Comparison Application..."
echo ""

# Check if backend dependencies are installed
echo "Checking backend dependencies..."
cd backend
if ! python -c "import pandas" 2>/dev/null; then
    echo "Backend dependencies not found. Installing..."
    pip install pandas fastapi uvicorn pyarrow python-multipart pydantic
    if [ $? -ne 0 ]; then
        echo "Failed to install backend dependencies. Please install manually:"
        echo "cd backend && pip install pandas fastapi uvicorn pyarrow python-multipart pydantic"
        exit 1
    fi
fi
cd ..

# Start Backend
echo "Starting Backend Server..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start. Check the error messages above."
    exit 1
fi

# Start Frontend
echo "Starting Frontend Dev Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are running in background."
echo "Backend: http://localhost:8000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "Or run ./stop.sh to stop them"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Keep script running
wait