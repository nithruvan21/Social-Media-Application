package com.project.social_media_application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import com.project.social_media_application.dtos.PostRequest;
import com.project.social_media_application.model.Post;
import com.project.social_media_application.model.User; // Import User
import com.project.social_media_application.repositories.PostRepository;
import com.project.social_media_application.repositories.UserRepository; // Import UserRepository

import jakarta.persistence.EntityNotFoundException;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository; // Inject UserRepository

    // Update constructor to inject UserRepository
    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional // Add Transactional annotation for operations involving multiple repos or lazy loading
    public Post createPost(PostRequest req, String userEmail) { // Change userId to userEmail for clarity
        // Find the user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail)); // Or a more specific exception

        // Create the Post entity using the User object
        Post post = new Post(req.getContent(), req.getTags(), req.getImageUrl(), user);
        return postRepository.save(post);
    }

    // No changes needed here for now, but consider pagination for large datasets
    public List<Post> getAllPosts() {
        // Fetching posts along with user data might cause N+1 problem if User is EAGER fetched
        // Since User is LAZY fetched in Post, this should be okay for now.
        // Consider using DTOs or Entity Graphs for optimization later.
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Add a method to get posts by user ID (which PostRepository already supports)
    @Transactional(readOnly = true) // readOnly=true for queries
    public List<Post> getPostsByUserId(Long userId) {
         // Ensure user exists before querying posts, or let the query return empty list
         if (!userRepository.existsById(userId)) {
              throw new RuntimeException("User not found with ID: " + userId); // Or return empty list
         }
        return postRepository.findByUserId(userId);
    }
    @Transactional // Ensure operations are transactional
public Post likePost(Long postId, Long userId) {
    // Find the post by its ID
    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));

    // Add the user's ID to the set of likes
    post.addLike(userId); // Use the helper method we added to Post.java

    // Save the updated post entity
    return postRepository.save(post);
}

@Transactional
public void deletePost(Long postId, Long requestingUserId){
    Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with Id: " + postId));

    if (!post.getUser().getId().equals(requestingUserId)) {
        throw new AccessDeniedException("User is not authorized to delete this post");
    }

    postRepository.deleteById(postId);
}

@Transactional // Ensure operations are transactional
public Post unlikePost(Long postId, Long userId) {
    // Find the post by its ID
    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));

    // Remove the user's ID from the set of likes
    post.removeLike(userId); // Use the helper method we added to Post.java

    // Save the updated post entity
    return postRepository.save(post);
}
    @Transactional(readOnly = true) // Good practice for query methods
    public List<Post> getFollowedUsersPosts(Long currentUserId) {
        // 1. Find the current user
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + currentUserId));

        // 2. Get the IDs of the users the current user is following
        // Ensure lazy loading works by accessing within the transaction
        Set<Long> followedUserIds = currentUser.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toSet()); // Collect IDs into a Set first

        // 3. Add the current user's own ID to the list (to see their own posts)
        followedUserIds.add(currentUserId); // Add self ID

        // 4. Fetch posts from the repository using the list of IDs
         if (followedUserIds.isEmpty()) {
             // Should technically not happen as self ID is always added, but good practice
             return new ArrayList<>();
         }
        return postRepository.findByUser_IdInOrderByCreatedAtDesc(followedUserIds);
         // Or use the JOIN FETCH version if you implement it:
         // return postRepository.findPostsByUserIdInWithUserFetched(followedUserIds);
    }

    @Transactional(readOnly = true)
    public List<Post> getPostsByTag(String tagName){
        if(tagName == null || tagName.trim().isEmpty()){
            return new ArrayList<>();
        }
        return postRepository.findByTag(tagName);
    }
    
}
