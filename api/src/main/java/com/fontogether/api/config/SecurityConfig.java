package com.fontogether.api.config;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {



    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 개발 편의를 위해 CSRF 비활성화 (프로덕션에선 검토 필요)
            .cors(cors -> cors.configure(http)) // WebConfig의 CORS 설정 사용
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers("/", "/error", "/ws/**").permitAll()
                .requestMatchers("/api/users/**").permitAll() // 로컬 로그인/가입
                .requestMatchers("/test/**").permitAll()      // 테스트용
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
