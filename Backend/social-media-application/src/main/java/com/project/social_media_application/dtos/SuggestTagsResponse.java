package com.project.social_media_application.dtos;

import java.util.List;

public class SuggestTagsResponse {
    private List<String> suggestedTags; // The list of tags suggested by the AI

    // Constructor
    public SuggestTagsResponse(List<String> suggestedTags) {
        this.suggestedTags = suggestedTags;
    }

    // Default constructor (needed for JSON serialization, though constructor is often sufficient)
    public SuggestTagsResponse() {
    }

    // Getters and Setters
    public List<String> getSuggestedTags() {
        return suggestedTags;
    }

    public void setSuggestedTags(List<String> suggestedTags) {
        this.suggestedTags = suggestedTags;
    }
}