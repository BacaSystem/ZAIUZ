# Multi-stage build for Angular frontend
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code (excluding node_modules to avoid platform conflicts)
COPY frontend/src ./src/
COPY frontend/public ./public/
COPY frontend/angular.json ./
COPY frontend/tsconfig*.json ./

# Build the Angular app for production with optimizations
RUN npm run build -- --configuration=production

# Production stage with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built app to nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY ops/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]