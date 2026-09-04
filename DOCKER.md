# Docker Deployment Guide

## Build the Docker Image

```bash
docker build -t parquet-comparison:latest .
```

## Run with Docker

```bash
docker run -p 80:80 -v $(pwd)/uploads:/app/uploads parquet-comparison:latest
```

## Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

## Access the Application

Once running, access the application at:
- **Frontend**: http://localhost
- **API**: http://localhost/api/

## Configuration

The Docker setup includes:
- **Frontend**: React + Vite static files served by Nginx
- **Backend**: Python FastAPI with pandas, pyarrow
- **Port**: 80 (single port for both frontend and API)
- **Uploads**: Mounted to `./uploads` directory

## Features

- Single container deployment
- Optimized multi-stage build
- Alpine Linux for minimal image size (~200-250MB)
- Nginx serves static files and proxies API requests
- CORS configured for Docker deployment
- File upload size limit: 500MB

## Troubleshooting

### Container won't start
Check logs:
```bash
docker logs <container_id>
```

### Port already in use
Change the port mapping:
```bash
docker run -p 8080:80 parquet-comparison:latest
```

### Build fails
Ensure Docker has enough memory and disk space. Try building without cache:
```bash
docker build --no-cache -t parquet-comparison:latest .
```

## Production Considerations

For production deployment:
1. Use environment variables for configuration
2. Add proper logging
3. Implement health checks
4. Use HTTPS with a reverse proxy
5. Add resource limits in docker-compose.yml
