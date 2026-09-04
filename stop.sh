#!/bin/bash

echo "Stopping Parquet Comparison Application..."

# Windows-specific process killing for Git Bash
echo "Stopping backend (port 8000)..."
netstat -ano | findstr :8000 | awk '{print $5}' | while read pid; do
    if [ ! -z "$pid" ]; then
        taskkill //F //PID $pid 2>/dev/null
    fi
done

echo "Stopping frontend (port 3000)..."
netstat -ano | findstr :3000 | awk '{print $5}' | while read pid; do
    if [ ! -z "$pid" ]; then
        taskkill //F //PID $pid 2>/dev/null
    fi
done

echo "Servers stopped."