package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.Series;
import com.zaiuz.mesurement.backend.domain.dto.SeriesDto;
import com.zaiuz.mesurement.backend.services.SeriesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost", "http://localhost:80"})
@Tag(name = "Series", description = "Operations for managing measurement series")
public class SeriesController {
    private final SeriesService seriesService;
    private final ModelMapper modelMapper;

    public SeriesController(SeriesService seriesService) {
        this.seriesService = seriesService;
        this.modelMapper = new ModelMapper();
    }

    @Operation(
            summary = "Get all series",
            description = "Retrieve all available measurement series. This endpoint is publicly accessible."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Series retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = SeriesDto.class))))
    })
    @GetMapping
    public ResponseEntity<List<SeriesDto>> getSeries() {
        List<Series> series = seriesService.getAll();
        return new ResponseEntity<>(series.stream().map(
                s -> modelMapper.map(s, SeriesDto.class))
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @Operation(
            summary = "Get series by ID",
            description = "Retrieve a specific measurement series by its unique identifier. This endpoint is publicly accessible."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Series found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SeriesDto.class))),
            @ApiResponse(responseCode = "404", description = "Series not found")
    })
    @GetMapping(path = "/{id}")
    public ResponseEntity<SeriesDto> getSeries(
            @Parameter(description = "Series ID")
            @PathVariable UUID id) {
        Optional<Series> foundSeries = seriesService.get(id);
        return foundSeries.map(s -> {
            SeriesDto seriesDto = modelMapper.map(s, SeriesDto.class);
            return new ResponseEntity<>(seriesDto, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
