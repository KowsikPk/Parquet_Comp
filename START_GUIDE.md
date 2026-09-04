# Quick Start Guide

## Starting the Application

You have several options to start both the frontend and backend servers:

### Option 1: Git Bash Scripts (Recommended for Git Bash)
```bash
# To start
./start.sh

# To stop
./stop.sh
```

### Option 2: Windows Batch Script
```bash
start.bat
```
This will open two separate windows for backend and frontend servers.

### Option 3: PowerShell Script
```powershell
.\start.ps1
```
This runs both servers in the background with combined output.

### Option 4: Node.js Script
```bash
npm start
```
Requires Node.js to be installed. Runs both servers with combined output.

### Option 5: Manual Start
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Stopping the Application

### Option 1: Git Bash Scripts
```bash
./stop-windows.sh
```

### Option 2: Windows Batch Script
```bash
stop.bat
```

### Option 3: Node.js Script
```bash
npm stop
```

### Option 4: Manual Stop
- Close the terminal windows
- Or use Ctrl+C in each terminal
- Or kill processes manually with task manager

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
1. Run `./stop.sh` to kill existing processes
2. Or manually kill processes on ports 3000 and 8000

### Backend Not Starting
- Ensure Python is installed: `python --version`
- Check dependencies: `cd backend && pip install -r requirements.txt`

### Frontend Not Starting
- Ensure Node.js is installed: `node --version`
- Install dependencies: `cd frontend && npm install`

### Script Permission Issues (Git Bash)
If you get "permission denied" errors:
```bash
# Make scripts executable
chmod +x start.sh stop.sh
```

## Development Tips

- The Git Bash scripts are optimized for your environment
- The batch script option is best for separate window debugging
- Use the PowerShell script for production-like combined logging
- The Node.js script is good if you already have Node.js in your PATH

## Recommended Workflow for Git Bash Users

1. **First time setup:**
   ```bash
   chmod +x start.sh stop.sh
   ```

2. **Start application:**
   ```bash
   ./start.sh
   ```

3. **Stop application:**
   ```bash
   ./stop.sh
   ```