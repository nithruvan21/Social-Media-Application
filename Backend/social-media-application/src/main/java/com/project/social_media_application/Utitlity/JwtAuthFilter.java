package com.project.social_media_application.Utitlity;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.project.social_media_application.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // --- DEBUG START ---
        String requestPath = request.getServletPath();
        System.out.println(">>> JwtAuthFilter processing request: " + requestPath);
        // --- DEBUG END ---


        String authHeader = request.getHeader("Authorization");

        // Skip filtering for public endpoints like /api/auth/**
        // String path = request.getServletPath(); // Already got this above
        if (requestPath.startsWith("/api/auth")) {
            System.out.println(">>> Skipping JWT filter for " + requestPath); // DEBUG
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        String email = null;

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            // --- DEBUG START ---
            System.out.println(">>> Token found in header: " + token);
            // --- DEBUG END ---
            try {
                email = jwtUtil.extractEmail(token); // May throw if token is invalid
                System.out.println(">>> Email extracted from token: " + email); // DEBUG
            } catch (Exception e) {
                // --- DEBUG START ---
                System.err.println(">>> Invalid JWT token extraction: " + e.getMessage());
                // --- DEBUG END ---
                // Log and skip setting auth context if token is malformed
                // System.err.println("Invalid JWT token: " + e.getMessage()); // Original line
                filterChain.doFilter(request, response);
                return;
            }
        } else {
            System.out.println(">>> No valid Bearer token found in Authorization header for " + requestPath); // DEBUG
        }

        // If email is extracted and user not already authenticated
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println(">>> Attempting to load user details for: " + email); // DEBUG
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            System.out.println(">>> Validating token..."); // DEBUG
            if (jwtUtil.validateToken(token)) {
                System.out.println(">>> Token validated successfully. Setting authentication context."); // DEBUG
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                 System.err.println(">>> Token validation failed!"); // DEBUG
            }
        } else if (email != null) {
            System.out.println(">>> SecurityContext already has authentication for " + email); // DEBUG
        }

        filterChain.doFilter(request, response);
    }
}