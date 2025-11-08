package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.Series;
import com.zaiuz.mesurement.backend.domain.User;
import com.zaiuz.mesurement.backend.domain.dto.CreateUpdateMeasurementDto;
import com.zaiuz.mesurement.backend.domain.dto.MeasurementDto;
import com.zaiuz.mesurement.backend.domain.dto.SeriesDto;
import com.zaiuz.mesurement.backend.domain.dto.UserDto;

import com.zaiuz.mesurement.backend.services.MeasurementService;
import com.zaiuz.mesurement.backend.services.SeriesService;
import com.zaiuz.mesurement.backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('Admin')")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Admin", description = "Administrative operations for managing users, series, and measurements")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final MeasurementService measurementService;
    private final SeriesService seriesService;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminController(MeasurementService measurementService, SeriesService seriesService, UserService userService, PasswordEncoder passwordEncoder) {
        this.measurementService = measurementService;
        this.seriesService = seriesService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = new ModelMapper();
    }

    // === SERIES ADMIN OPERATIONS ===

    @Operation(
            summary = "Create new series",
            description = "Create a new measurement series (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Series created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SeriesDto.class))),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PostMapping("/series")
    public ResponseEntity<SeriesDto> createSeries(@RequestBody @Valid SeriesDto createDto) {
        Series series = Series.builder()
                .name(createDto.getName())
                .color(createDto.getColor())
                .minValue(createDto.getMinValue())
                .maxValue(createDto.getMaxValue())
                .createdBy("admin")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Series savedSeries = seriesService.create(series);
        return new ResponseEntity<>(modelMapper.map(savedSeries, SeriesDto.class), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update series",
            description = "Update an existing measurement series by ID (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Series updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SeriesDto.class))),
            @ApiResponse(responseCode = "404", description = "Series not found"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/series/{id}")
    public ResponseEntity<SeriesDto> updateSeries(
            @Parameter(description = "Series ID to update")
            @PathVariable UUID id, 
            @RequestBody @Valid SeriesDto updateDto) {
        if (seriesService.get(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Series seriesDetails = Series.builder()
                .name(updateDto.getName())
                .color(updateDto.getColor())
                .minValue(updateDto.getMinValue())
                .maxValue(updateDto.getMaxValue())
                .build();

        Series updatedSeries = seriesService.update(id, seriesDetails);
        return new ResponseEntity<>(modelMapper.map(updatedSeries, SeriesDto.class), HttpStatus.OK);
    }

    @Operation(
            summary = "Delete series",
            description = "Delete a measurement series by ID (Admin only). This will also delete all associated measurements."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Series deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Series not found"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @DeleteMapping("/series/{id}")
    public ResponseEntity<?> deleteSeries(
            @Parameter(description = "Series ID to delete")
            @PathVariable UUID id) {
        if (seriesService.get(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        seriesService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Create new measurement",
            description = "Create a new measurement entry for a specific series (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Measurement created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MeasurementDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - Invalid series ID or measurement data"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PostMapping("/measurements")
    public ResponseEntity<MeasurementDto> createMeasurement(@RequestBody @Valid CreateUpdateMeasurementDto createDto) {
        Optional<Series> series = seriesService.get(createDto.getSeriesId());
        if (series.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Measurement measurement = Measurement.builder()
                .series(series.get())
                .value(createDto.getValue())
                .timestamp(createDto.getTimestamp())
                .createdBy("admin")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Measurement savedMeasurement = measurementService.create(measurement);
        return new ResponseEntity<>(modelMapper.map(savedMeasurement, MeasurementDto.class), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update measurement",
            description = "Update an existing measurement by ID (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Measurement updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MeasurementDto.class))),
            @ApiResponse(responseCode = "404", description = "Measurement not found"),
            @ApiResponse(responseCode = "400", description = "Bad request - Invalid series ID or measurement data"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/measurements/{id}")
    public ResponseEntity<MeasurementDto> updateMeasurement(
            @Parameter(description = "Measurement ID to update")
            @PathVariable UUID id, 
            @RequestBody @Valid CreateUpdateMeasurementDto updateDto) {
        if (measurementService.get(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Optional<Series> series = seriesService.get(updateDto.getSeriesId());
        if (series.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Measurement measurementDetails = Measurement.builder()
                .series(series.get())
                .value(updateDto.getValue())
                .timestamp(updateDto.getTimestamp())
                .build();

        Measurement updatedMeasurement = measurementService.update(id, measurementDetails);
        return new ResponseEntity<>(modelMapper.map(updatedMeasurement, MeasurementDto.class), HttpStatus.OK);
    }

    @Operation(
            summary = "Delete measurement",
            description = "Delete a specific measurement by ID (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Measurement deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Measurement not found"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @DeleteMapping("/measurements/{id}")
    public ResponseEntity<?> deleteMeasurement(
            @Parameter(description = "Measurement ID to delete")
            @PathVariable UUID id) {
        if (measurementService.get(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        measurementService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    // === USER ADMIN OPERATIONS ===
    
    @Operation(
            summary = "Get all users",
            description = "Retrieve all system users (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = UserDto.class)))),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userService.getAll();
        List<UserDto> userDtos = users.stream().map(this::convertToUserDto).collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @Operation(
            summary = "Create new user",
            description = "Create a new user account with specified role (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "409", description = "Conflict - Username already exists"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        if (userService.get(userDto.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        User newUser = User.builder()
                .username(userDto.getUsername())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .role(userDto.getRole())
                .createdBy("admin")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        User savedUser = userService.create(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToUserDto(savedUser));
    }

    @Operation(
            summary = "Update user",
            description = "Update an existing user's information including username, password, and role (Admin only)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - Username already exists"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(
            @Parameter(description = "User ID to update")
            @PathVariable UUID id, 
            @Valid @RequestBody UserDto userDto) {
        Optional<User> existingUser = userService.get(id);
        if (existingUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = existingUser.get();
        
        if (!user.getUsername().equals(userDto.getUsername())) {
            Optional<User> userWithNewUsername = userService.get(userDto.getUsername());
            if (userWithNewUsername.isPresent() && !userWithNewUsername.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            user.setUsername(userDto.getUsername());
        }

        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty() && !"********".equals(userDto.getPassword())) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        user.setRole(userDto.getRole());
        user.setUpdatedAt(OffsetDateTime.now());

        User updatedUser = userService.update(id, user);
        return ResponseEntity.ok(convertToUserDto(updatedUser));
    }

    @Operation(
            summary = "Delete user",
            description = "Delete a user account by ID (Admin only). Use with caution as this permanently removes the user."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @Parameter(description = "User ID to delete")
            @PathVariable UUID id) {
        if (userService.get(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to convert User to UserDto with masked password
    private UserDto convertToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password("********")
                .role(user.getRole())
                .build();
    }
}