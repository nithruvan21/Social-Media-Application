package com.project.social_media_application.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // <<< Make sure this import is present
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Import if missing
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// PasswordEncoder already imported via BCryptPasswordEncoder
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.project.social_media_application.Utitlity.JwtAuthFilter;
import com.project.social_media_application.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity // Good practice to explicitly enable web security
public class SecurityConfig {

    @Autowired private JwtAuthFilter jwtAuthFilter;
    @Autowired private CustomUserDetailsService userDetailsService;
    // Inject the OAuth2 success handler
    @Autowired private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // Keep CSRF disabled for stateless APIs
            .cors(Customizer.withDefaults()) // Apply CORS configuration from CorsConfig bean
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/oauth2/code/**", "/error").permitAll()
                // Allow anyone to GET comments
                .requestMatchers(HttpMethod.GET, "/api/posts/{postId}/comments").permitAll()

                // --- ADD THIS LINE to allow CORS preflight requests ---
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // --- END ADDITION ---

                // Secure all other API endpoints (including POSTing comments)
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll() // Consider restricting this in production
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // MUST remain STATELESS for JWT/OAuth token flow
            .userDetailsService(userDetailsService) // Keep custom user service for JWT validation
            // Add OAuth2 Login configuration
            .oauth2Login(oauth2 -> oauth2
                // Optional: Define the endpoint the frontend redirects to for starting login
                // .authorizationEndpoint(authz -> authz.baseUri("/oauth2/authorization"))
                // Optional: Define where Google redirects back to (usually handled by default)
                // .redirectionEndpoint(redir -> redir.baseUri("/login/oauth2/code/*"))
                // Optional: Define where to get user info (usually handled by default)
                // .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService())) // Use if you need custom user mapping
                .successHandler(oAuth2AuthenticationSuccessHandler) // Use our custom success handler!
                 // Optional: Add a failure handler
                 // .failureHandler(authenticationFailureHandler())
            )
            // Add JWT filter before the standard username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        // Keep this for potential manual login flows or other auth needs
        return config.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        // Keep the password encoder
        return new BCryptPasswordEncoder();
    }
}