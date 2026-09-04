# Stage 1: Build React frontend using public Node.js Alpine image (smaller and faster)
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Python backend with Nginx using public Python Alpine image (smaller and faster)
FROM python:3.11-alpine AS backend
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache nginx

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build artifacts
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for file uploads
RUN mkdir -p /app/uploads && chown -R nobody:nobody /app/uploads

# Expose port 80
EXPOSE 80

# Start both services
CMD sh -c "python backend/main.py & nginx -g 'daemon off;'"
