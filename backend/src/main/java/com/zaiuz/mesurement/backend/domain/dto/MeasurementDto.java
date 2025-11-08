package com.zaiuz.mesurement.backend.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Measurement data with associated series information")
public class MeasurementDto {
    @Schema(description = "Unique measurement identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;
    
    @Schema(description = "Associated measurement series")
    private SeriesDto series;
    
    @Schema(description = "Measured value", example = "23.5")
    private double value;
    
    @Schema(description = "Timestamp when measurement was taken", example = "2024-11-06T10:30:00Z")
    private OffsetDateTime timestamp;
}
