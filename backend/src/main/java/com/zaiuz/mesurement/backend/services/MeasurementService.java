package com.zaiuz.mesurement.backend.services;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.Series;
import com.zaiuz.mesurement.backend.domain.dto.MeasurementDto;
import com.zaiuz.mesurement.backend.repositories.MeasurementRepository;
import com.zaiuz.mesurement.backend.repositories.SeriesRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class MeasurementService {
    private final MeasurementRepository measurementRepository;
    private final SeriesRepository seriesRepository;

    public MeasurementService(MeasurementRepository measurementRepository, SeriesRepository seriesRepository) {
        this.measurementRepository = measurementRepository;
        this.seriesRepository = seriesRepository;
    }

    public Measurement create(Measurement measurement) {
        return measurementRepository.save(measurement);
    }

    public Measurement update(UUID id, Measurement measurementDetails) {
        if (get(id).isEmpty()) return null;

        Measurement measurement = get(id).get();
        measurement.setValue(measurementDetails.getValue());
        measurement.setTimestamp(measurementDetails.getTimestamp());
        measurement.setSeries(measurementDetails.getSeries());
        measurement.setUpdatedAt(OffsetDateTime.now());

        return measurementRepository.save(measurement);
    }

    public Page<Measurement> query(List<UUID> seriesIds, OffsetDateTime from, OffsetDateTime to, Pageable pageable) {
        List<Series> series = (seriesIds == null || seriesIds.isEmpty())
                ? seriesRepository.findAll()
                : seriesRepository.findAllById(seriesIds);
        if (from == null) from = OffsetDateTime.parse("1970-01-01T00:00:00Z");
        if (to == null) to = OffsetDateTime.now();
        return measurementRepository.findBySeriesInAndTimestampBetween(series, from, to, pageable);
    }

    public List<Measurement> getAll() {
        return measurementRepository.findAll();
    }

    public Optional<Measurement> get(UUID id) {
        return measurementRepository.findById(id);
    }

    public void delete(UUID id) {
        measurementRepository.deleteById(id);
    }

    public void delete(Measurement measurement) {
        measurementRepository.delete(measurement);
    }
}
