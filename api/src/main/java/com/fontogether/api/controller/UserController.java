package com.fontogether.api.controller;

import com.fontogether.api.model.domain.User;
import com.fontogether.api.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
/**
 * 사용자 관련 REST API 컨트롤러
 * - 회원가입, 로그인 엔드포인트 제공
 */
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            Long userId = userService.signUp(request.getEmail(), request.getPassword(), request.getNickname());
            return ResponseEntity.ok(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Signup Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login Error: " + e.getMessage());
        }
    }

    @Data
    public static class SignupRequest {
        private String email;
        private String password;
        private String nickname;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
