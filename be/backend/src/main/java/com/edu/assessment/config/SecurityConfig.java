package com.edu.assessment.config;

import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor // <-- Bổ sung Lombok để tự inject UserRepository
public class SecurityConfig {

    private final UserRepository userRepository; // <-- Bổ sung mới: Gọi xuống DB

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Dùng BCrypt để băm mật khẩu
    }

    // <-- BỔ SUNG MỚI: Chỉ cho Spring biết cách tra cứu User trong MySQL bằng Số điện thoại
    @Bean
    public UserDetailsService userDetailsService() {
        return phoneNumber -> {
            com.edu.assessment.entity.User user = userRepository.findByPhoneNumber(phoneNumber)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy số điện thoại: " + phoneNumber));

            if (!user.getIsActive()) {
                throw new org.springframework.security.authentication.DisabledException("Tài khoản của bạn đã bị khóa!");
            }

            return new User(
                    user.getPhoneNumber(),
                    user.getPasswordHash(),
                    List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF để làm REST API cho React Vite
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Bật CORS
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Cho phép nhúng iframe
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/api/v1/files/**").permitAll() // Mở tự do cho API Đăng ký, Đăng nhập & File PDF
                        .requestMatchers("/api/v1/center-manager/**").hasRole("CENTER_MANAGER") // Các endpoint quản trị yêu cầu quyền CENTER_MANAGER
                        .anyRequest().authenticated() // Các API khác bắt buộc phải đăng nhập
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // Tự động tạo Session Cookie khi login
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000")); // URL của React Vite
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // CỰC KỲ QUAN TRỌNG: Cho phép trình duyệt gửi kèm Cookie Session
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(
            org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}