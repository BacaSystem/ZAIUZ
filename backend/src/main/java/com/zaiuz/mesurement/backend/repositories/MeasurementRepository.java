package com.zaiuz.mesurement.backend.repositories;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.Series;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.UUID;

public interface MeasurementRepository extends JpaRepository<Measurement, UUID> {
    @Query("SELECT m FROM Measurement m JOIN FETCH m.series s WHERE s IN :series AND m.timestamp BETWEEN :from AND :to")
    Page<Measurement> findBySeriesInAndTimestampBetweenWithSeries(
            @Param("series") Collection<Series> series, 
            @Param("from") OffsetDateTime from, 
            @Param("to") OffsetDateTime to, 
            Pageable pageable);
}
