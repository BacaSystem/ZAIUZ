package com.zaiuz.mesurement.backend.config;

import com.zaiuz.mesurement.backend.security.JwtAuthenticationFilter;
import com.zaiuz.mesurement.backend.security.SystemUserDetailService;
import com.zaiuz.mesurement.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import static org.springframework.http.HttpMethod.GET;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserService userService;
    @Autowired
    private SystemUserDetailService userDetailService;
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(registry -> {
                    // Public endpoints
                    registry.requestMatchers("/auth/**").permitAll();
                    registry.requestMatchers(GET, "/api/series", "/api/series/**").permitAll();
                    registry.requestMatchers(GET, "/api/measurement", "/api/measurement/**").permitAll();
                    
                    // Actuator endpoints for health checks
                    registry.requestMatchers("/actuator/**").permitAll();
                    
                    // Swagger/OpenAPI endpoints - public access for development
                    registry.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll();

                    // Admin endpoints - require Admin role
                    registry.requestMatchers("/api/admin/**").hasAuthority("Admin");
                    
                    // All other API endpoints require authentication
                    registry.requestMatchers("/api/**").authenticated();
                    
                    // Any other request requires authentication
                    registry.anyRequest().authenticated();
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow development origins
        // For production deployment, add your VM IP or domain to this list
        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",     // Angular dev server
            "http://localhost:3000",     // Frontend container (port 3000)
            "http://localhost",          // Frontend container (port 80)
            "http://localhost:80",       // Frontend container (explicit port 80)
            "https://localhost",         // HTTPS variant
            "https://localhost:80"       // HTTPS variant with port
        ));
        configuration.setAllowedMethods(List.of("GET","POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**",configuration);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userDetailService.loadUserByUsername(username);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
