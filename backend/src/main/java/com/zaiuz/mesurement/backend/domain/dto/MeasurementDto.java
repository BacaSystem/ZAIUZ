package com.zaiuz.mesurement.backend.domain.dto;

import com.zaiuz.mesurement.backend.domain.Series;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class MeasurementDto {
    private UUID id;
    private Series series;
    private double value;
    private OffsetDateTime timestamp;
}
