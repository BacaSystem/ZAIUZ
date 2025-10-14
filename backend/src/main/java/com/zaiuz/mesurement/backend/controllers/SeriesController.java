package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.Series;
import com.zaiuz.mesurement.backend.domain.dto.SeriesDto;
import com.zaiuz.mesurement.backend.services.SeriesService;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/series")
public class SeriesController {
    private final SeriesService seriesService;
    private final ModelMapper modelMapper;

    public SeriesController(SeriesService seriesService) {
        this.seriesService = seriesService;
        this.modelMapper = new ModelMapper();
    }

    @GetMapping
    public ResponseEntity<List<SeriesDto>> getSeries() {
        List<Series> series = seriesService.getAll();
        return new ResponseEntity<>(series.stream().map(
                s -> modelMapper.map(s, SeriesDto.class))
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<SeriesDto> getSeries(@PathVariable UUID id) {
        Optional<Series> foundSeries = seriesService.get(id);
        return foundSeries.map(s -> {
            SeriesDto seriesDto = modelMapper.map(s, SeriesDto.class);
            return new ResponseEntity<>(seriesDto, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<SeriesDto> createSeries(@RequestBody SeriesDto seriesDto) {
        Series series = seriesService.create(modelMapper.map(seriesDto, Series.class));
        return new ResponseEntity<>(modelMapper.map(series, SeriesDto.class),HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<SeriesDto> updateSeries(@PathVariable UUID id, @RequestBody SeriesDto seriesDto) {
        if (seriesService.get(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Series seriesDetails = modelMapper.map(seriesDto, Series.class);
        Series series = seriesService.update(id, seriesDetails);
        return new ResponseEntity<>(modelMapper.map(series, SeriesDto.class), HttpStatus.OK);
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity deleteSeries(@PathVariable UUID id) {
        seriesService.delete(id);
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }
}
