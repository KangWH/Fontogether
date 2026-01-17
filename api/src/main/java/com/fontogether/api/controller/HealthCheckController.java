package com.fontogether.api.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthCheckController {

    private final JdbcTemplate jdbcTemplate;

    public HealthCheckController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        // Raw SQL로 현재 DB 시간 조회
        String sql = "SELECT NOW() as current_time";
        
        try {
            // DB 연결 테스트
            Map<String, Object> result = jdbcTemplate.queryForMap(sql);
            return Map.of(
                    "status", "ok",
                    "db_time", result.get("current_time"),
                    "message", "Fontogether API is running!"
            );
        } catch (Exception e) {
            return Map.of(
                    "status", "error",
                    "message", e.getMessage()
            );
        }
    }
}