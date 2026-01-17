package com.fontogether.api.service;

import com.fontogether.api.model.domain.User;
import com.fontogether.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * 사용자 비즈니스 로직 서비스
 * - 회원가입 (중복 이메일 체크)
 * - 로그인 (비밀번호 확인)
 */
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public Long signUp(String email, String password, String nickname) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // 비밀번호 암호화 (BCrypt)
        String encodedPassword = passwordEncoder.encode(password);

        User newUser = User.builder()
                .email(email)
                .password(encodedPassword)
                .nickname(nickname)
                .build();

        return userRepository.save(newUser);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // 암호화된 비밀번호 비교
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        return user;
    }
}
