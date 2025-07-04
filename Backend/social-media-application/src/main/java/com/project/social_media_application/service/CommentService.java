package com.project.social_media_application.service;

import com.project.social_media_application.dtos.CommentRequest;
import com.project.social_media_application.model.Comment;
import com.project.social_media_application.model.Post;
import com.project.social_media_application.model.User;
import com.project.social_media_application.repositories.CommentRepository;
import com.project.social_media_application.repositories.PostRepository;
import com.project.social_media_application.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository; // To find the post being commented on

    @Autowired
    private UserRepository userRepository; // To find the user making the comment

    @Transactional
    public Comment addComment(Long postId, Long userId, CommentRequest commentRequest) {
        // Validate that the post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));

        // Validate that the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // Create the new comment entity
        Comment comment = new Comment(
                commentRequest.getContent(), // Get content from the request DTO
                post,                       // Associate with the found post
                user                        // Associate with the found user (author)
        );

        // Save the comment to the database
        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true) // Use readOnly for query methods
    public List<Comment> getCommentsByPostId(Long postId) {
        // Optional: Check if post exists first, though the query will return empty if not.
        // if (!postRepository.existsById(postId)) {
        //    throw new EntityNotFoundException("Post not found with ID: " + postId);
        // }

        // Use the repository method to find comments for the given post, ordered by time
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    // Optional: Add methods for deleting or updating comments later if needed
    /*
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found with ID: " + commentId));

        // Check if the user attempting to delete is the author of the comment
        // Or potentially allow post author or admin to delete? Define your rules.
        if (!comment.getUser().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
    */
}