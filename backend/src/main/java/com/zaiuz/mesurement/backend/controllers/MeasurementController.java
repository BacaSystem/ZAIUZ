package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.Series;
import com.zaiuz.mesurement.backend.domain.User;
import com.zaiuz.mesurement.backend.domain.dto.MeasurementDto;
import com.zaiuz.mesurement.backend.domain.dto.SeriesDto;
import com.zaiuz.mesurement.backend.domain.dto.UserDto;
import com.zaiuz.mesurement.backend.services.MeasurementService;
import com.zaiuz.mesurement.backend.services.UserService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/measurement")
public class MeasurementController {
    private final MeasurementService measurementService;
    private final ModelMapper modelMapper;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
        this.modelMapper = new ModelMapper();
    }

    @GetMapping
    public ResponseEntity<Page<MeasurementDto>> query(
            @RequestParam(required = false) List<UUID> seriesIds,
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        Page<Measurement> measurementPage = measurementService.query(seriesIds, from, to, PageRequest.of(page, size, Sort.by("timestamp").ascending()));
        Page<MeasurementDto> dtoPage = measurementPage.map(m -> modelMapper.map(m, MeasurementDto.class));

        return ResponseEntity.ok(dtoPage);
    }
//
//    @GetMapping
//    public ResponseEntity<List<MeasurementDto>> getAllMeasurements() {
//        List<Measurement> measurements = measurementService.getAll();
//        return new ResponseEntity<>(measurements.stream().map(
//                        m -> modelMapper.map(m, MeasurementDto.class))
//                .collect(Collectors.toList()), HttpStatus.OK);
//    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<MeasurementDto> getMeasurement(@PathVariable UUID id) {
        Optional<Measurement> foundMeasurement = measurementService.get(id);
        return foundMeasurement.map(m -> {
            MeasurementDto measurementDto = modelMapper.map(m, MeasurementDto.class);
            return new ResponseEntity<>(measurementDto, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    @PostMapping
    public ResponseEntity<MeasurementDto> createMeasurement(@RequestBody @Valid MeasurementDto measurementDto) {
        Measurement measurement = measurementService.create(modelMapper.map(measurementDto, Measurement.class));
        return new ResponseEntity<>(modelMapper.map(measurement, MeasurementDto.class), HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<MeasurementDto> updateMeasurement(@PathVariable UUID id, @RequestBody @Valid MeasurementDto measurementDto) {
        if(measurementService.get(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Measurement measurementDetails = modelMapper.map(measurementDto, Measurement.class);
        Measurement measurement = measurementService.update(id, modelMapper.map(measurementDto, Measurement.class));
        return new ResponseEntity<>(modelMapper.map(measurement, MeasurementDto.class), HttpStatus.CREATED);
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity deleteMeasurement(@PathVariable UUID id) {
        measurementService.delete(id);
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }
}
