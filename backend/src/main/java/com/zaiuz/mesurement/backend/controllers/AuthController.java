package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.User;
import com.zaiuz.mesurement.backend.domain.dto.AuthResponseDto;
import com.zaiuz.mesurement.backend.domain.dto.ChangePasswordRequestDto;
import com.zaiuz.mesurement.backend.domain.dto.LoginRequestDto;
import com.zaiuz.mesurement.backend.domain.dto.RegisterRequestDto;
import com.zaiuz.mesurement.backend.security.JwtService;
import com.zaiuz.mesurement.backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost", "http://localhost:80"})
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {
    
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, 
                         JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Operation(
            summary = "User login",
            description = "Authenticate user credentials and return JWT token"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Invalid username or password\"}"))),
            @ApiResponse(responseCode = "500", description = "Authentication failed",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Authentication failed\"}")))
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Optional<User> user = userService.get(userDetails.getUsername());
            
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not found"));
            }

            String token = jwtService.generateToken(userDetails);
            
            AuthResponseDto response = AuthResponseDto.builder()
                .token(token)
                .userId(user.get().getId())
                .username(user.get().getUsername())
                .role(user.get().getRole())
                .expiresIn(jwtService.getExpirationTime())
                .build();

            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Authentication failed"));
        }
    }

    @Operation(
            summary = "User registration",
            description = "Register a new user account and return JWT token"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registration successful",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponseDto.class))),
            @ApiResponse(responseCode = "409", description = "Username already exists",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Username already exists\"}"))),
            @ApiResponse(responseCode = "500", description = "Registration failed",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Registration failed\"}")))
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto registerRequest) {
        try {
            if (userService.get(registerRequest.getUsername()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
            }

            User newUser = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role("User")
                .createdBy("system")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

            User savedUser = userService.create(newUser);

            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(savedUser.getUsername())
                .password(savedUser.getPassword())
                .authorities("User")
                .build();

            String token = jwtService.generateToken(userDetails);

            AuthResponseDto response = AuthResponseDto.builder()
                .token(token)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .expiresIn(jwtService.getExpirationTime())
                .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @Operation(
            summary = "User logout",
            description = "Logout user (client-side token removal)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logout successful",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Successfully logged out\"}")))
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Since we're using stateless JWT, logout is handled on the frontend
        // by removing the token from storage
        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    @Operation(
            summary = "Get current user",
            description = "Get information about the currently authenticated user"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User information retrieved",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"userId\": \"123e4567-e89b-12d3-a456-426614174000\", \"username\": \"john_doe\", \"role\": \"User\"}"))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Not authenticated\"}"))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"User not found\"}")))
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Not authenticated"));
        }

        String username = authentication.getName();
        Optional<User> user = userService.get(username);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found"));
        }

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", user.get().getId());
        userInfo.put("username", user.get().getUsername());
        userInfo.put("role", user.get().getRole());

        return ResponseEntity.ok(userInfo);
    }

    @Operation(
            summary = "Change password",
            description = "Change password for the currently authenticated user"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password changed successfully",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Password changed successfully\"}"))),
            @ApiResponse(responseCode = "400", description = "Invalid current password or password confirmation",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Current password is incorrect\"}"))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Not authenticated\"}"))),
            @ApiResponse(responseCode = "500", description = "Failed to change password",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"message\": \"Failed to change password\"}")))
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequestDto changePasswordRequest, 
                                          Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Not authenticated"));
        }

        try {
            String username = authentication.getName();
            Optional<User> userOptional = userService.get(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
            }

            User user = userOptional.get();

            if (!changePasswordRequest.isPasswordConfirmed()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New password and confirmation do not match"));
            }

            if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect"));
            }

            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            user.setUpdatedAt(OffsetDateTime.now());
            
            userService.update(user.getId(), user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to change password: " + e.getMessage()));
        }
    }
}