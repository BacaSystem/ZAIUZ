package com.zaiuz.mesurement.backend.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Authentication response containing JWT token and user information")
public class AuthResponseDto {
    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "Token type", example = "Bearer", defaultValue = "Bearer")
    private String type = "Bearer";
    
    @Schema(description = "User unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID userId;
    
    @Schema(description = "Username", example = "john_doe")
    private String username;
    
    @Schema(description = "User role", example = "User", allowableValues = {"User", "Admin"})
    private String role;
    
    @Schema(description = "Token expiration time in milliseconds", example = "3600000")
    private long expiresIn;
}