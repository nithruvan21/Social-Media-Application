package com.project.social_media_application.controller;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable; // Import PathVariable
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.social_media_application.Utitlity.JwtUtil;
import com.project.social_media_application.dtos.PostRequest;
import com.project.social_media_application.dtos.PostResponse; // Create this DTO
import com.project.social_media_application.dtos.SuggestTagsRequest;
import com.project.social_media_application.dtos.SuggestTagsResponse;
import com.project.social_media_application.model.Post;
import com.project.social_media_application.model.User;
// PostRepository is no longer needed here directly
import com.project.social_media_application.repositories.UserRepository;
import com.project.social_media_application.service.AiTaggingService;
import com.project.social_media_application.service.ImageUploadService;
import com.project.social_media_application.service.PostService;

import jakarta.persistence.EntityNotFoundException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/posts")
// @CrossOrigin("*") // Consider restricting origins in production
public class PostController {

    // Use constructor injection (recommended) or @Autowired
    private final PostService postService;
    private final ImageUploadService imageService;
    private final JwtUtil jwtUtil; // Renamed from jwtUtils for consistency
    private final UserRepository userRepository; // Keep for fetching user ID if needed
    private final AiTaggingService aiTaggingService;

    // Constructor injection
    public PostController(PostService postService, ImageUploadService imageService, JwtUtil jwtUtil, UserRepository userRepository,AiTaggingService aiTaggingService) {
        this.postService = postService;
        this.imageService = imageService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.aiTaggingService = aiTaggingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = imageService.uploadImage(file);
             // Return the URL in a structured way, e.g., JSON
            return ResponseEntity.ok(java.util.Map.of("imageUrl", url));
        } catch (IOException e) {
             // Provide a more informative error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "Image upload failed: " + e.getMessage()));
        } catch (RuntimeException e) {
             // Catch potential runtime exceptions from the service (like Cloudinary errors)
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    // Helper method to extract email from token
    private String getEmailFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header is missing or invalid");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

     // Helper method to convert Post entity to PostResponse DTO
     private PostResponse convertToPostResponse(Post post, Long currentUserId) {
        if (post == null) return null;
        PostResponse dto = new PostResponse();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setTags(post.getTags());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt());
    
        // Populate user info including profile picture
        if (post.getUser() != null) {
            dto.setUserId(post.getUser().getId());
            dto.setUserName(post.getUser().getName());
            // --- ADDED: Set the user's profile picture URL ---
            dto.setUserProfilePictureUrl(post.getUser().getProfilePictureUrl());
        }
    
        // Populate Like Info (existing logic)
        Set<Long> likes = post.getLikes();
        dto.setLikeCount(likes.size());
        dto.setLikedByCurrentUser(currentUserId != null && likes.contains(currentUserId));
    
        // Populate Club Info (if you had implemented clubs)
        // if (post.getClub() != null) { ... }
    
        return dto;
    }
    // Helper method to get the current logged-in user's ID
private Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
        // Handle cases where user is not authenticated or details are not available
         // Depending on your security config, principal might be UserDetails or OAuth2User
         // For now, returning null or throwing exception might be options.
         // Returning null means posts won't show as 'liked' for unauthenticated views (which might be okay).
         return null;
        // OR throw new IllegalStateException("User not authenticated");
    }

    String userEmail;
    Object principal = authentication.getPrincipal();

    if (principal instanceof UserDetails) {
        userEmail = ((UserDetails) principal).getUsername();
    } else if (principal instanceof String) {
        userEmail = (String) principal; // Handle cases where principal might just be the email string
    }
     else {
         // Handle other principal types if necessary (e.g., OAuth2User)
         // For now, we assume email is the username from UserDetails
         throw new IllegalStateException("Unexpected principal type: " + principal.getClass());
    }


    // Fetch user from repository to get the ID
    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + userEmail));
    return user.getId();
}

    // --- Modify existing methods ---

@PostMapping // Modify createPost slightly if needed (though like count will be 0 initially)
public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest request, @RequestHeader("Authorization") String authHeader) {
    String userEmail = getEmailFromAuthHeader(authHeader);
    Post createdPost = postService.createPost(request, userEmail);
    Long currentUserId = getCurrentUserId(); // Get current user ID
    return ResponseEntity.status(HttpStatus.CREATED).body(convertToPostResponse(createdPost, currentUserId)); // Pass ID
}


@GetMapping
public ResponseEntity<List<PostResponse>> getAllPosts() {
    Long currentUserId = getCurrentUserId(); // Get current user ID
    List<Post> posts = postService.getAllPosts();
    List<PostResponse> response = posts.stream()
                                       .map(post -> convertToPostResponse(post, currentUserId)) // Pass ID
                                       .collect(Collectors.toList());
    return ResponseEntity.ok(response);
}

    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()") // Ensure user is logged in
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            // Should not happen due to @PreAuthorize, but good practice
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        try {
            postService.deletePost(postId, currentUserId);
            // Return 204 No Content on successful deletion
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            // Post not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            // User is not the author
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            // Catch other potential errors during deletion
            System.err.println("Error deleting post " + postId + ": " + e.getMessage());
            // Return 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete post.");
        }
    }

@GetMapping("/my-posts")
public ResponseEntity<List<PostResponse>> getMyPosts(@RequestHeader("Authorization") String authHeader) {
    Long currentUserId = getCurrentUserId(); // Get current user ID (already derived below, slightly redundant but ok)
    String userEmail = getEmailFromAuthHeader(authHeader);
    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
    List<Post> posts = postService.getPostsByUserId(user.getId());
     List<PostResponse> response = posts.stream()
                                       .map(post -> convertToPostResponse(post, currentUserId)) // Pass ID
                                       .collect(Collectors.toList());
    return ResponseEntity.ok(response);
}

@GetMapping("/user/{userId}")
public ResponseEntity<List<PostResponse>> getPostsByUserId(@PathVariable Long userId) {
     Long currentUserId = getCurrentUserId(); // Get current user ID
     List<Post> posts = postService.getPostsByUserId(userId);
     List<PostResponse> response = posts.stream()
                                       .map(post -> convertToPostResponse(post, currentUserId)) // Pass ID
                                       .collect(Collectors.toList());
    return ResponseEntity.ok(response);
}
// --- Add New Like/Unlike Endpoints ---

@PostMapping("/{postId}/like")
public ResponseEntity<PostResponse> likePost(@PathVariable Long postId) {
    Long userId = getCurrentUserId(); // Get the ID of the user performing the action
    if (userId == null) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Or handle appropriately
    }
    Post updatedPost = postService.likePost(postId, userId);
    return ResponseEntity.ok(convertToPostResponse(updatedPost, userId)); // Return updated post DTO
}

@DeleteMapping("/{postId}/like")
public ResponseEntity<PostResponse> unlikePost(@PathVariable Long postId) {
    Long userId = getCurrentUserId(); // Get the ID of the user performing the action
     if (userId == null) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Or handle appropriately
    }
    Post updatedPost = postService.unlikePost(postId, userId);
    return ResponseEntity.ok(convertToPostResponse(updatedPost, userId)); // Return updated post DTO
}
    @GetMapping("/feed")
    @PreAuthorize("isAuthenticated()") // Ensure user is logged in
    public ResponseEntity<List<PostResponse>> getFollowedFeed() {
        Long currentUserId = getCurrentUserId(); // Get current user's ID
        if (currentUserId == null) {
             // This check might be redundant due to @PreAuthorize, but adds safety
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
             List<Post> feedPosts = postService.getFollowedUsersPosts(currentUserId);
             List<PostResponse> response = feedPosts.stream()
                    .map(post -> convertToPostResponse(post, currentUserId)) // Reuse existing DTO conversion
                    .collect(Collectors.toList());
             return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
             // If the current user wasn't found (shouldn't happen if authenticated)
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Or appropriate error DTO
        } catch (Exception e) {
             // Log the exception
             System.err.println("Error fetching feed: " + e.getMessage());
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @GetMapping("/tag/{tagName}")
    // No specific authentication needed here unless you want to restrict tag search
    public ResponseEntity<List<PostResponse>> getPostsByTag(@PathVariable String tagName) {
        // Optional: URL Decode tagName if it might contain special characters
        // String decodedTagName = URLDecoder.decode(tagName, StandardCharsets.UTF_8); // Example if needed
        try {
            List<Post> posts = postService.getPostsByTag(tagName); // Use tagName directly for now
            Long currentUserId = getCurrentUserId(); // Get ID to check like status
            List<PostResponse> response = posts.stream()
                    .map(post -> convertToPostResponse(post, currentUserId)) // Reuse DTO conversion
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
             // Log the exception
             System.err.println("Error fetching posts by tag '" + tagName + "': " + e.getMessage());
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/suggest-tags")
    @PreAuthorize("isAuthenticated()") // Ensure user is logged in
    public Mono<ResponseEntity<SuggestTagsResponse>> suggestTags(@RequestBody SuggestTagsRequest request) {
         // Basic validation on the request body content
         if (request == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
             // Immediately return bad request for empty content
             return Mono.just(ResponseEntity.badRequest()
                                      .body(new SuggestTagsResponse(Collections.emptyList())));
         }

         // Call the service method, which returns a Mono
         return aiTaggingService.suggestTags(request.getContent())
                .map(tags -> {
                    // If tags were successfully retrieved (even if empty list)
                    System.out.println("SuggestTags endpoint returning tags: " + tags); // Log success
                    return ResponseEntity.ok(new SuggestTagsResponse(tags));
                })
                .defaultIfEmpty( // If the Mono completed empty (e.g., service returned empty Mono directly)
                     ResponseEntity.ok(new SuggestTagsResponse(Collections.emptyList()))
                )
                .onErrorResume(error -> { // Handle any errors during the reactive stream
                    System.err.println("Error in suggestTags endpoint processing: " + error.getMessage());
                    // Log the error properly in a real application
                    // Return an empty list with a 500 status on error
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                             .body(new SuggestTagsResponse(Collections.emptyList())));
                });
    }
}