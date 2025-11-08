# ZAUIZ Backend - Swagger/OpenAPI Documentation

## Overview

This document describes the Swagger/OpenAPI 3 integration that has been added to the ZAUIZ IoT measurement system backend. The API documentation provides comprehensive information about all endpoints, request/response models, and authentication requirements.

## What Was Added

### 1. Dependencies
- **springdoc-openapi-starter-webmvc-ui:2.2.0** - Provides OpenAPI 3 support and Swagger UI

### 2. Configuration Files

#### application.properties
```properties
# OpenAPI/Swagger Configuration
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
springdoc.swagger-ui.tryItOutEnabled=true
```

#### OpenApiConfig.java
- Custom OpenAPI configuration with project metadata
- JWT Bearer authentication scheme definition
- Development and production server configurations
- Contact information and licensing details

### 3. Security Configuration Updates
Updated `SecurityConfig.java` to allow public access to Swagger endpoints:
- `/swagger-ui/**`
- `/swagger-ui.html`
- `/v3/api-docs/**`
- `/api-docs/**`

### 4. Controller Documentation

#### Authentication Controller (`/auth`)
- **POST /auth/login** - User authentication
- **POST /auth/register** - User registration
- **POST /auth/logout** - User logout
- **GET /auth/me** - Get current user info
- **POST /auth/change-password** - Change user password

#### Measurements Controller (`/api/measurement`)
- **GET /api/measurement** - Query measurements with filtering
- **GET /api/measurement/{id}** - Get specific measurement

#### Series Controller (`/api/series`)
- **GET /api/series** - Get all measurement series
- **GET /api/series/{id}** - Get specific series

#### Admin Controller (`/api/admin`)
- **Series Management**: Create, update, delete series
- **Measurement Management**: Create, update, delete measurements
- **User Management**: CRUD operations for users

### 5. DTO Documentation

All DTOs have been enhanced with `@Schema` annotations:
- **LoginRequestDto** - Login credentials
- **AuthResponseDto** - JWT authentication response
- **MeasurementDto** - Measurement data
- **SeriesDto** - Series configuration
- **CreateUpdateMeasurementDto** - Measurement creation/update
- **UserDto** - User information

## API Documentation URLs

Once the application is running, you can access the API documentation at:

### Swagger UI (Interactive Documentation)
```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON Specification
```
http://localhost:8080/api-docs
```

### OpenAPI YAML Specification
```
http://localhost:8080/api-docs.yaml
```

## Features

### 1. Interactive Testing
- **Try It Out** functionality enabled
- Test API endpoints directly from the browser
- JWT token authentication support

### 2. Comprehensive Documentation
- Detailed endpoint descriptions
- Request/response examples
- Parameter documentation
- Error response codes

### 3. Authentication Integration
- JWT Bearer token scheme configured
- Security requirements clearly marked
- Token usage examples provided

### 4. Organized Structure
- Endpoints grouped by tags (Authentication, Measurements, Series, Admin)
- Operations sorted by HTTP method
- Tags sorted alphabetically

## How to Use

### 1. Start the Application
```bash
cd C:\Studia\ZAUIZ\backend
.\gradlew bootRun
```

### 2. Access Swagger UI
Open your browser and navigate to: `http://localhost:8080/swagger-ui.html`

### 3. Authenticate (for protected endpoints)
1. Click on "Authorize" button in Swagger UI
2. Obtain a JWT token by calling `/auth/login` endpoint
3. Enter the token in the format: `Bearer <your-jwt-token>`
4. Now you can test protected endpoints

### 4. Test Endpoints
- Expand any endpoint section
- Click "Try it out"
- Fill in required parameters
- Click "Execute" to see the response

## API Endpoints Summary

| Group | Endpoint | Method | Description | Auth Required |
|-------|----------|--------|-------------|---------------|
| Authentication | `/auth/login` | POST | User login | No |
| Authentication | `/auth/register` | POST | User registration | No |
| Authentication | `/auth/logout` | POST | User logout | No |
| Authentication | `/auth/me` | GET | Get current user | Yes |
| Authentication | `/auth/change-password` | POST | Change password | Yes |
| Measurements | `/api/measurement` | GET | Query measurements | Yes |
| Measurements | `/api/measurement/{id}` | GET | Get measurement by ID | Yes |
| Series | `/api/series` | GET | Get all series | Yes |
| Series | `/api/series/{id}` | GET | Get series by ID | Yes |
| Admin | `/api/admin/series` | POST | Create series | Yes (Admin) |
| Admin | `/api/admin/series/{id}` | PUT | Update series | Yes (Admin) |
| Admin | `/api/admin/series/{id}` | DELETE | Delete series | Yes (Admin) |
| Admin | `/api/admin/measurements` | POST | Create measurement | Yes (Admin) |
| Admin | `/api/admin/measurements/{id}` | PUT | Update measurement | Yes (Admin) |
| Admin | `/api/admin/measurements/{id}` | DELETE | Delete measurement | Yes (Admin) |
| Admin | `/api/admin/users` | GET | Get all users | Yes (Admin) |
| Admin | `/api/admin/users` | POST | Create user | Yes (Admin) |
| Admin | `/api/admin/users/{id}` | PUT | Update user | Yes (Admin) |
| Admin | `/api/admin/users/{id}` | DELETE | Delete user | Yes (Admin) |

## Example Usage

### 1. Login
```bash
curl -X POST "http://localhost:8080/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

### 2. Query Measurements (with token)
```bash
curl -X GET "http://localhost:8080/api/measurement?page=0&size=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Benefits

1. **Developer Experience**: Easy to understand and test APIs
2. **Documentation**: Always up-to-date API documentation
3. **Client Generation**: Can generate client SDKs in various languages
4. **Testing**: Built-in testing capabilities
5. **Standards Compliance**: Follows OpenAPI 3.0 specification

## Next Steps

1. **Start the application** and verify Swagger UI is accessible
2. **Test authentication flow** using the interactive documentation
3. **Explore all endpoints** to ensure proper documentation
4. **Consider adding more detailed examples** for complex request/response objects
5. **Add API versioning** if needed for future development

## Troubleshooting

### Common Issues

1. **Swagger UI not accessible**
   - Verify application is running on port 8080
   - Check that security configuration allows access to Swagger endpoints

2. **Authentication not working**
   - Ensure JWT token is properly formatted: `Bearer <token>`
   - Verify token is not expired
   - Check that endpoints requiring authentication are properly secured

3. **Missing documentation**
   - Verify all controllers have `@Tag` annotations
   - Check that operations have `@Operation` annotations
   - Ensure DTOs have `@Schema` annotations

## Configuration Options

You can customize the Swagger UI behavior by modifying these properties in `application.properties`:

```properties
# Change API docs path
springdoc.api-docs.path=/api-docs

# Change Swagger UI path
springdoc.swagger-ui.path=/swagger-ui.html

# Sort operations by method
springdoc.swagger-ui.operationsSorter=method

# Sort tags alphabetically
springdoc.swagger-ui.tagsSorter=alpha

# Enable Try It Out by default
springdoc.swagger-ui.tryItOutEnabled=true

# Disable Swagger UI in production
springdoc.swagger-ui.enabled=false
```

## Security Considerations

- **Production Environment**: Consider disabling Swagger UI in production (`springdoc.swagger-ui.enabled=false`)
- **Access Control**: Add IP restrictions or additional authentication for documentation access if needed
- **Sensitive Information**: Ensure no sensitive data is exposed in examples or descriptions