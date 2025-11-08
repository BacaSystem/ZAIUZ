package com.zaiuz.mesurement.backend.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Request object for creating or updating measurements")
public class CreateUpdateMeasurementDto {
    @Schema(description = "ID of the series this measurement belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    @NotNull
    private UUID seriesId;
    
    @Schema(description = "Measured value", example = "23.5", required = true)
    @NotNull
    private double value;
    
    @Schema(description = "Timestamp when measurement was taken", example = "2024-11-06T10:30:00Z", required = true)
    @NotNull
    private OffsetDateTime timestamp;
}