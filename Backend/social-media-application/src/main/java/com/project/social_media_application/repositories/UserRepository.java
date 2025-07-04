package com.project.social_media_application.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.social_media_application.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByNameContainingIgnoreCase(String nameQuery);

    // Optional: Add pagination later if needed
    // Page<User> findByNameContainingIgnoreCase(String nameQuery, Pageable pageable);
}
