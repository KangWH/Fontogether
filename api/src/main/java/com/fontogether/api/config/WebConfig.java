package com.fontogether.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@org.springframework.lang.NonNull CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해
                .allowedOriginPatterns("*") // 모든 출처 허용 (보안상 주의 필요하지만 개발 단계에선 OK)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
