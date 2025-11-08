package com.zaiuz.mesurement.backend.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Login request containing user credentials")
public class LoginRequestDto {
    @Schema(description = "Username for authentication", example = "john_doe", required = true)
    @NotBlank(message = "Username is required")
    private String username;
    
    @Schema(description = "Password for authentication", example = "mySecurePassword123", required = true)
    @NotBlank(message = "Password is required")
    private String password;
}