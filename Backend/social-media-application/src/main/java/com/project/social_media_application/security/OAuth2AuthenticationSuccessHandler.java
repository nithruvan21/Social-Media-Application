package com.project.social_media_application.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.project.social_media_application.Utitlity.JwtUtil;
import com.project.social_media_application.model.User;
import com.project.social_media_application.repositories.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component // Make this class a Spring Bean
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil; // Inject JwtUtil to generate tokens

    @Autowired
    private UserRepository userRepository; // Inject UserRepository to find/save users

    // Get the frontend URL from application properties (add this property later)
    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String pictureUrl = oauthUser.getAttribute("picture");
        // You can also get other attributes like picture if needed:
        // String picture = oauthUser.getAttribute("picture");

        if (email == null) {
            logger.error("Email not found from OAuth2 provider");
            // Redirect to an error page on the frontend
            getRedirectStrategy().sendRedirect(request, response, UriComponentsBuilder.fromUriString(redirectUri).queryParam("error", "EmailNotFound").build().toUriString());
            return;
        }

        // Find user by email or create a new one
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            boolean updated = false; // Flag to check if save is needed

            // Optional: Update user details if they changed (e.g., name)
            if (name != null && !name.equals(user.getName())) {
                user.setName(name);
                updated = true; // Mark as updated
            }

            // --- ADDED: Update picture URL if changed or missing ---
            if (pictureUrl != null && !pictureUrl.equals(user.getProfilePictureUrl())) {
                user.setProfilePictureUrl(pictureUrl); // Use the setter method
                updated = true; // Mark as updated
            }

            // Save only if something was actually updated
            if (updated) {
                userRepository.save(user);
                logger.info("Updated user details via OAuth2 for: " + email);
            }

        } else {
            // Create a new user if they don't exist
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : "New User"); // Use name or a default
            // --- ADDED: Set picture URL for new user ---
            user.setProfilePictureUrl(pictureUrl); // Use the setter method

            // Set other required fields to default/null initially
            user.setDepartment(null);
            user.setStudyYear(null);
            user.setDateOfBirth(null);
            user.setStudentId(null);
            user.setContactNumber(null);
            user.setAddress(null);
            // Ensure password is null or handled appropriately for OAuth users
            // user.setPassword(null);

            userRepository.save(user);
            logger.info("Created new user via OAuth2: " + email);
        }

        // Generate JWT token for the user
        String token = jwtUtil.generateToken(user.getEmail());

        // Build the redirect URL with the token
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build().toUriString();

        // Clear any previous authentication attributes
        clearAuthenticationAttributes(request);

        // Redirect the user to the frontend URL with the token
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}