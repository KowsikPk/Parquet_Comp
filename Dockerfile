# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Python backend with Nginx using slim python image (Debian-based)
FROM python:3.11-slim AS backend
WORKDIR /app

# Install system dependencies including nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build artifacts
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
RUN sed -i 's/\r$//' /etc/nginx/nginx.conf || true

# Create directories for file uploads
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port 80
EXPOSE 80

# Start both services (Nginx and Uvicorn on 127.0.0.1)
CMD ["sh", "-c", "nginx -g 'daemon off;' & python backend/main.py"]
