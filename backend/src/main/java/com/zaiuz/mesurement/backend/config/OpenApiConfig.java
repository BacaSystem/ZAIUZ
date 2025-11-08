package com.zaiuz.mesurement.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ZAUIZ - Measurements API")
                        .description("REST API for measurement data management system. " +
                                "This API provides endpoints for managing measurement series, " +
                                "collecting sensor data, user authentication, and administrative functions.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Dominik Baczyński")
                                .email("dominik.baczynski.stud@pw.edu.pl")
                                .url("https://github.com/BacaSystem/ZAIUZ")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development server"),
                        new Server()
                                .url("https://api.zauiz.com")
                                .description("Production server")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token for API authentication. " +
                                                "Obtain token from /auth/login endpoint.")));
    }
}