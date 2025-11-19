package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.dto.MeasurementDto;
import com.zaiuz.mesurement.backend.services.MeasurementService;
import com.zaiuz.mesurement.backend.services.SeriesService;
import com.zaiuz.mesurement.backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/measurement")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost", "http://localhost:80"})
@Tag(name = "Measurements", description = "Operations for querying measurement data")
public class MeasurementController {
    private final MeasurementService measurementService;
    private final ModelMapper modelMapper;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
        this.modelMapper = new ModelMapper();
    }

    @Operation(
            summary = "Query measurements",
            description = "Retrieve measurements with optional filtering by series, time range, and pagination. This endpoint is publicly accessible."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Measurements retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Page.class)))
    })
    @GetMapping
    public ResponseEntity<Page<MeasurementDto>> query(
            @Parameter(description = "List of series IDs to filter by")
            @RequestParam(required = false) List<UUID> seriesIds,
            @Parameter(description = "Start time for filtering measurements (ISO 8601 format)")
            @RequestParam(required = false) OffsetDateTime from,
            @Parameter(description = "End time for filtering measurements (ISO 8601 format)")
            @RequestParam(required = false) OffsetDateTime to,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page")
            @RequestParam(defaultValue = "100") int size) {

        Page<Measurement> measurementPage = measurementService.query(seriesIds, from, to, PageRequest.of(page, size, Sort.by("timestamp").ascending()));
        Page<MeasurementDto> dtoPage = measurementPage.map(m -> modelMapper.map(m, MeasurementDto.class));

        return ResponseEntity.ok(dtoPage);
    }

    @Operation(
            summary = "Get measurement by ID",
            description = "Retrieve a specific measurement by its unique identifier. This endpoint is publicly accessible."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Measurement found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MeasurementDto.class))),
            @ApiResponse(responseCode = "404", description = "Measurement not found")
    })
    @GetMapping(path = "/{id}")
    public ResponseEntity<MeasurementDto> getMeasurement(
            @Parameter(description = "Measurement ID")
            @PathVariable UUID id) {
        Optional<Measurement> foundMeasurement = measurementService.get(id);
        return foundMeasurement.map(m -> {
            MeasurementDto measurementDto = modelMapper.map(m, MeasurementDto.class);
            return new ResponseEntity<>(measurementDto, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
