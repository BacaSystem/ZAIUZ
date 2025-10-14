package com.zaiuz.mesurement.backend.services;

import com.zaiuz.mesurement.backend.domain.Series;
import com.zaiuz.mesurement.backend.repositories.SeriesRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SeriesService {
    private final SeriesRepository seriesRepository;

    public SeriesService(SeriesRepository seriesRepository) {
        this.seriesRepository = seriesRepository;
    }

    public Series create(Series series) {
        series.setUpdatedAt(OffsetDateTime.now());

        return seriesRepository.save(series);
    }

    public Series update(UUID id, Series seriesDetails) {
        if (get(id).isEmpty()) return null;

        Series series = get(id).get();
        series.setName(seriesDetails.getName());
        series.setMinValue(seriesDetails.getMinValue());
        series.setMaxValue(seriesDetails.getMaxValue());
        series.setColor(seriesDetails.getColor());
        series.setCreatedBy(seriesDetails.getCreatedBy());
        series.setCreatedAt(seriesDetails.getCreatedAt());
        series.setUpdatedAt(OffsetDateTime.now());

        return seriesRepository.save(series);
    }

    public Optional<Series> get(UUID id) {
        return seriesRepository.findById(id);
    }

    public List<Series> getAll() {
        return seriesRepository.findAll();
    }

    public void delete(UUID id) {
        seriesRepository.deleteById(id);
    }

    public void delete(Series series) {
        seriesRepository.delete(series);
    }
}
