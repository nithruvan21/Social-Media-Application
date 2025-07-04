package com.project.social_media_application.dtos;

public class SuggestTagsRequest {
    private String content; // The post content sent from the frontend

    // Default constructor (needed for JSON deserialization)
    public SuggestTagsRequest() {
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}