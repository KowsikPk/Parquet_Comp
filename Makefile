.PHONY: start stop start-backend start-frontend install-backend install-frontend clean

# Start both servers
start:
	@echo "Starting Parquet Comparison Application..."
	@cd backend && python main.py &
	@sleep 3
	@cd frontend && npm run dev &
	@echo "Both servers started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

# Stop both servers
stop:
	@echo "Stopping servers..."
	@netstat -ano | findstr :8000 | awk '{print $$5}' | xargs -I {} taskkill //F //PID {} 2>/dev/null || true
	@netstat -ano | findstr :3000 | awk '{print $$5}' | xargs -I {} taskkill //F //PID {} 2>/dev/null || true
	@echo "Servers stopped."

# Start only backend
start-backend:
	@echo "Starting Backend Server..."
	@cd backend && python main.py

# Start only frontend
start-frontend:
	@echo "Starting Frontend Dev Server..."
	@cd frontend && npm run dev

# Install backend dependencies
install-backend:
	@echo "Installing backend dependencies..."
	@cd backend && pip install pandas fastapi uvicorn pyarrow python-multipart pydantic

# Install frontend dependencies
install-frontend:
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

# Install all dependencies
install: install-backend install-frontend

# Clean up
clean:
	@echo "Cleaning up..."
	@rm -rf frontend/node_modules frontend/dist
	@rm -rf backend/__pycache__ backend/*.pyc
	@echo "Cleanup complete."