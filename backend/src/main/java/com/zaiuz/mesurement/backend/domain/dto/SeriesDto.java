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
@Schema(description = "Measurement series configuration")
public class SeriesDto {
    @Schema(description = "Unique series identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Series name", example = "Temperature", required = true)
    private String name;
    
    @Schema(description = "Display color for charts", example = "#F44336", pattern = "^#[0-9A-Fa-f]{6}$")
    private String color;
    
    @Schema(description = "Minimum allowed value for measurements", example = "-30.0")
    private double minValue;
    
    @Schema(description = "Maximum allowed value for measurements", example = "60.0")
    private double maxValue;
}
