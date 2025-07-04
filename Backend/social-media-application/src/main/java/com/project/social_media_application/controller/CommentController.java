package com.project.social_media_application.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.social_media_application.dtos.CommentRequest;
import com.project.social_media_application.dtos.CommentResponse;
import com.project.social_media_application.model.Comment;
import com.project.social_media_application.model.User;
import com.project.social_media_application.repositories.UserRepository;
import com.project.social_media_application.service.CommentService;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepository userRepository; // Need this to get user ID from email

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
             return null; // Or return null if endpoint might be accessed anonymously (e.g., GET comments)
        }

        String userEmail;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            userEmail = (String) principal;
        } else {
             throw new IllegalStateException("Unexpected principal type: " + principal.getClass());
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + userEmail));
        return user.getId();
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        if (comment == null) return null;

        CommentResponse dto = new CommentResponse();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());

        if (comment.getUser() != null) {
            dto.setUserId(comment.getUser().getId());
            dto.setUserName(comment.getUser().getName());
        }

        if (comment.getPost() != null) {
            dto.setPostId(comment.getPost().getId());
        }

        return dto;
    }


    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addCommentToPost(
            @PathVariable Long postId,
            @RequestBody CommentRequest commentRequest) {

        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be logged in to comment.");
        }

        try {
            Comment savedComment = commentService.addComment(postId, userId, commentRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToCommentResponse(savedComment));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add comment: " + e.getMessage());
        }
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getCommentsForPost(@PathVariable Long postId) {
         try {
            List<Comment> comments = commentService.getCommentsByPostId(postId);
            List<CommentResponse> response = comments.stream()
                    .map(this::convertToCommentResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
         } catch (EntityNotFoundException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
         } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve comments: " + e.getMessage());
         }
    }

    /*
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        Long userId = getCurrentUserId();
         if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be logged in to delete comments.");
        }
        try {
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.noContent().build(); // Standard 204 No Content on successful delete
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete comment: " + e.getMessage());
        }
    }
    */
}