package com.zaiuz.mesurement.backend.domain.dto;

import jakarta.persistence.Column;
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
public class SeriesDto {
    private UUID id;

    private String name;
    private String color;
    private double minValue;
    private double maxValue;
}
