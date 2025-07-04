package com.project.social_media_application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.social_media_application.Utitlity.JwtUtil;
import com.project.social_media_application.dtos.AuthRequest;
import com.project.social_media_application.dtos.AuthResponse;
import com.project.social_media_application.dtos.RegisterRequest;
import com.project.social_media_application.model.User;
import com.project.social_media_application.repositories.UserRepository;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDepartment(request.getDepartment());
        user.setStudyYear(request.getStudyYear());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setStudentId(request.getStudentId());
        user.setContactNumber(request.getContactNumber());
        user.setAddress(request.getAddress());
        userRepo.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        var user = userRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println(user.getEmail());
        System.out.println(user.getName());
        System.out.println(user.getPassword());

        System.out.println("Request: "+request.getPassword());

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        System.out.println("Token: "+token);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
