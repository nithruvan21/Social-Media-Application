package com.project.social_media_application.dtos;

// DTO for receiving new comment data from the client
public class CommentRequest {

    // Only need the content from the client request body
    private String content;

    // Default constructor
    public CommentRequest() {
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}