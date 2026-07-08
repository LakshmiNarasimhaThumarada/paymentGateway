package com.paysecure.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private Environment environment;

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping("/health")
    public Map<String, Object> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", environment.getProperty("spring.application.name", "paysecure-backend"));
        response.put("activeProfiles", environment.getActiveProfiles().length > 0 ? environment.getActiveProfiles() : new String[]{"dev"});
        response.put("timestamp", LocalDateTime.now().toString());

        // Check database connection
        Map<String, Object> dbStatus = new HashMap<>();
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                dbStatus.put("status", "CONNECTED");
                dbStatus.put("databaseProduct", conn.getMetaData().getDatabaseProductName());
                dbStatus.put("databaseVersion", conn.getMetaData().getDatabaseProductVersion());
            } catch (Exception e) {
                dbStatus.put("status", "DOWN");
                dbStatus.put("error", e.getMessage());
            }
        } else {
            dbStatus.put("status", "NOT_CONFIGURED");
        }
        response.put("database", dbStatus);

        // System information
        Map<String, Object> systemInfo = new HashMap<>();
        systemInfo.put("os", System.getProperty("os.name"));
        systemInfo.put("javaVersion", System.getProperty("java.version"));
        systemInfo.put("cores", Runtime.getRuntime().availableProcessors());
        systemInfo.put("freeMemory", Runtime.getRuntime().freeMemory());
        systemInfo.put("totalMemory", Runtime.getRuntime().totalMemory());
        response.put("system", systemInfo);

        return response;
    }
}
