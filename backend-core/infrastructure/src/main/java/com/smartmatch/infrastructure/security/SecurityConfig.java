package com.smartmatch.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Thêm cấu hình CORS để trình duyệt không chặn Axios
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 2. Cho phép tất cả các request dò đường (OPTIONS) đi qua
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public APIs
                        .requestMatchers("/api/auth/**", "/api/public/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Candidate APIs
                        .requestMatchers(HttpMethod.POST, "/api/candidate/**").hasRole("CANDIDATE")
                        .requestMatchers(HttpMethod.GET, "/api/candidate/**").hasAnyRole("CANDIDATE", "EMPLOYER", "ADMIN")

                        // Employer APIs
                        .requestMatchers(HttpMethod.POST, "/api/employer/**").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.GET, "/api/employer/**").hasAnyRole("EMPLOYER", "ADMIN")

                        // Admin
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 3. Khai báo chi tiết các cấu hình CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép Frontend truy cập (Cổng 5173 của Vite)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // Cho phép các method HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cho phép các headers chứa JWT và định dạng JSON
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));

        // Cho phép gửi credentials (nếu sau này bạn xài Cookie)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
    }
}