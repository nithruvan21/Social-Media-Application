package com.project.social_media_application.service;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException; // Import this
import org.springframework.stereotype.Service;

import com.project.social_media_application.model.User; // Import your User model
import com.project.social_media_application.repositories.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException { // Add throws clause
        // Find the user by email from your repository
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // --- FIX IS HERE ---
        // Provide a non-null password to the UserDetails constructor.
        // Use an empty string "" if the password from DB is null (e.g., for OAuth users).
        String password = user.getPassword() != null ? user.getPassword() : "";

        // Create the Spring Security UserDetails object
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),       // username
            password,              // password (non-null)
            new ArrayList<>()      // authorities (empty list for now)
        );
    }
}