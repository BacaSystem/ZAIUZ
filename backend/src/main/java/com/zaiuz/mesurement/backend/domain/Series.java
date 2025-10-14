package com.zaiuz.mesurement.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "series")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Series {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String color;
    @Column(name = "min_Value", nullable = false)
    private double minValue;
    @Column(name = "max_Value", nullable = false)
    private double maxValue;

    @Column(name = "created_by", nullable = false)
    private String createdBy = "system";
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
