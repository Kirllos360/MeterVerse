package com.meterverse.reporting.shared.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "https://meter-verse.app",
                        "https://*.meter-verse.app"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders(
                        "Content-Disposition",
                        "Content-Length",
                        "Content-Type"
                )
                .allowCredentials(true)
                .maxAge(3600);

        registry.addMapping("/actuator/**")
                .allowedOrigins("*")
                .allowedMethods("GET")
                .maxAge(1800);
    }
}
