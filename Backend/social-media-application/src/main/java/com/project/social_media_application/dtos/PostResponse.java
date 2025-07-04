package com.project.social_media_application.dtos;

import java.time.LocalDateTime;
import java.util.List;
// No Set import needed here unless you use it directly

public class PostResponse {
    private Long id;
    private String content;
    private List<String> tags;
    private String imageUrl;
    private LocalDateTime createdAt;
    private Long userId;
    private String userName;
    // --- ADDED ---
    private String userProfilePictureUrl; // Author's picture URL

    // Like info (keep as is)
    private int likeCount;
    private boolean likedByCurrentUser;

    // Default constructor (keep)
    public PostResponse() {}

    // --- Getters & Setters ---
    // (Keep existing getters/setters for id, content, tags, etc.)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public boolean isLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }


    // --- ADDED Getter & Setter ---
    public String getUserProfilePictureUrl() { return userProfilePictureUrl; }
    public void setUserProfilePictureUrl(String userProfilePictureUrl) { this.userProfilePictureUrl = userProfilePictureUrl; }
}