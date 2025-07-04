package com.project.social_media_application.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Optional, but good practice

import com.project.social_media_application.model.Comment;

@Repository // Indicate this is a Spring Data repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Method to find all comments for a specific post ID, ordered by creation time
    // Spring Data JPA will automatically generate the query based on the method name
    // findByPost_IdOrderByCreatedAtAsc -> find Comments where the 'post' field's 'id' property matches, order by createdAt ascending
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    // You could also use Desc for descending order (newest first)
    // List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);

}