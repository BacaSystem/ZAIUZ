# ZAIUZ Measurements - Docker Deployment Guide

This guide covers how to deploy the ZAIUZ measurements application using Docker in both development and production environments.

## Quick Start (Development)

1. Navigate to the ops directory:
   ```bash
   cd ops
   ```

2. Start all services:
   ```bash
   docker-compose up --build -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000 (or http://localhost depending on configuration)
   - Backend API: http://localhost:8080
   - Database: localhost:5433

4. Default credentials:
   - Admin: `admin` / `password`
   - User: `user` / `password`

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- SSL certificates (for HTTPS)
- Domain name configured
- Cloud database (optional, or use containerized PostgreSQL)

### Steps

1. **Configure Environment Variables**
   
   Copy and customize the production environment file:
   ```bash
   cp .env.production .env.prod
   ```
   
   Update `.env.prod` with your production values:
   - `POSTGRES_PASSWORD`: Strong database password
   - `JWT_SECRET_KEY`: Secure JWT secret (generate with `openssl rand -hex 32`)
   - `FRONTEND_ORIGIN`: Your domain (e.g., https://yourdomain.com)
   - `DATABASE_HOST`: External database host (if using cloud database)

2. **Deploy with Production Configuration**
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.prod up --build -d
   ```

3. **Using External Database**
   
   If using a cloud database (recommended for production):
   - Set `DATABASE_HOST` to your cloud database host
   - Set `DATABASE_PORT` to your cloud database port
   - Remove or comment out the `db` service in docker-compose.production.yml
   - Update backend `depends_on` to remove database dependency

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │───▶│     Backend     │───▶│   PostgreSQL    │
│   (Angular)     │    │  (Spring Boot)  │    │   Database      │
│     Nginx       │    │      Java       │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      Port 80              Port 8080              Port 5432
```

### Services

#### Frontend Service
- **Technology**: Angular + Nginx
- **Port**: 80 (configurable via FRONTEND_PORT)
- **Features**: 
  - Optimized production build
  - Nginx reverse proxy for API calls
  - Health checks enabled
  - Static file caching

#### Backend Service  
- **Technology**: Spring Boot (Java 21)
- **Port**: 8080 (configurable via BACKEND_PORT)
- **Features**:
  - RESTful API
  - JWT authentication
  - PostgreSQL integration
  - Swagger documentation at `/swagger-ui.html`
  - Health checks disabled (pending actuator security fix)

#### Database Service
- **Technology**: PostgreSQL 16
- **Port**: 5432 (mapped to 5433 in development)
- **Features**:
  - Persistent data storage
  - Health checks enabled
  - Initialization scripts
  - Sample data included

### Environment Variables

| Variable | Description | Development Default | Production |
|----------|-------------|---------------------|------------|
| `POSTGRES_DB` | Database name | measurements_db | measurements_db |
| `POSTGRES_USER` | Database user | user | user |
| `POSTGRES_PASSWORD` | Database password | password | **Must be changed** |
| `JWT_SECRET_KEY` | JWT signing key | Default key | **Must be changed** |
| `JWT_EXPIRATION_TIME` | JWT expiration (ms) | 3600000 | 3600000 |
| `FRONTEND_ORIGIN` | CORS origin | http://localhost:4200 | **Your domain** |
| `DATABASE_HOST` | Database host | db | **Cloud DB host** |
| `BACKEND_PORT` | Backend port | 8080 | 8080 |
| `FRONTEND_PORT` | Frontend port | 3000 | 80 |

### Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **JWT Secret**: Generate a secure JWT secret key
3. **HTTPS**: Use HTTPS in production (configure reverse proxy)
4. **Database**: Use managed database service in production
5. **Firewall**: Restrict access to necessary ports only
6. **Health Checks**: Re-enable backend health checks after fixing actuator security

### Troubleshooting

#### Backend Health Check Issues
The backend health check is currently disabled due to Spring Security blocking actuator endpoints. This is noted in the code and will be fixed in future versions.

#### Port Conflicts
If you encounter port conflicts, update the port mappings in the environment file:
```bash
BACKEND_PORT=8081
FRONTEND_PORT=8082
PG_PORT=5434
```

#### Database Connection Issues
- Ensure database service is healthy: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify environment variables: `docker-compose config`

### Cloud Deployment Platforms

This Docker setup is compatible with:
- **AWS**: ECS, EC2, Elastic Beanstalk
- **Google Cloud**: Cloud Run, GKE, Compute Engine  
- **Azure**: Container Instances, AKS, App Service
- **DigitalOcean**: App Platform, Droplets
- **Heroku**: Container Registry

### Monitoring and Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
```

### Backup and Restore

Backup database:
```bash
docker exec measurements-db pg_dump -U user measurements_db > backup.sql
```

Restore database:
```bash
docker exec -i measurements-db psql -U user measurements_db < backup.sql
```

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | Containerized PostgreSQL | Cloud Database recommended |
| HTTPS | HTTP (localhost) | HTTPS required |
| Logging | Verbose | Minimal |
| Health Checks | Simplified | Comprehensive |
| Secrets | Default values | Environment-specific |
| Build | Development mode | Production optimized |

## Next Steps

1. Fix actuator security configuration for proper health checks
2. Add SSL/TLS configuration
3. Implement proper logging and monitoring
4. Add database migration scripts
5. Set up CI/CD pipeline
6. Add container orchestration (Kubernetes) support