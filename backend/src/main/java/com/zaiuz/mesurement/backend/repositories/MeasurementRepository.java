package com.zaiuz.mesurement.backend.repositories;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.Series;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.UUID;

public interface MeasurementRepository extends JpaRepository<Measurement, UUID> {
    Page<Measurement> findBySeriesInAndTimestampBetween(
            Collection<Series> series, OffsetDateTime from, OffsetDateTime to, Pageable pageable);
}
