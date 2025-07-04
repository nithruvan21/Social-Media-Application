package com.project.social_media_application.dtos;

import java.time.LocalDateTime;

// DTO for sending comment details back to the client
public class CommentResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;       // ID of the user who created the comment
    private String userName;   // Name of the user who created the comment
    private Long postId;       // ID of the post the comment belongs to

    // Default constructor
    public CommentResponse() {
    }

    // Getters and Setters for all fields

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }
}