package com.project.social_media_application.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT") // Use TEXT for potentially long content
    private String content;

    @ElementCollection(fetch = FetchType.EAGER) // EAGER fetch might be okay for tags, consider LAZY if many tags per post
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags;

    private String imageUrl; // URL from Cloudinary

    @ManyToOne(fetch = FetchType.LAZY) // Use LAZY fetching for performance
    @JoinColumn(name = "user_id", nullable = false) // Link to the users table, ensure it's not null
    private User user; // Changed from String userId to User user

    @Column(nullable = false, updatable = false) // Ensure createdAt is set and not changed
    private LocalDateTime createdAt;

    // Add a default constructor for JPA
    public Post() {
        this.createdAt = LocalDateTime.now(); // Set creation time by default
    }

    // Updated constructor
    public Post(String content, List<String> tags, String imageUrl, User user) {
        this.content = content;
        this.tags = tags;
        this.imageUrl = imageUrl;
        this.user = user;
        this.createdAt = LocalDateTime.now(); // Ensure createdAt is set here too
    }

    @ElementCollection(fetch = FetchType.EAGER) // EAGER fetch might be okay for like counts, LAZY might be better for large numbers
@CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
@Column(name = "user_id") // Store the ID of the user who liked the post
private Set<Long> likes = new HashSet<>(); // Initialize to avoid NullPointerExceptions

// --- Add Getter and Setter for likes ---

public Set<Long> getLikes() {
    return likes;
}

public void setLikes(Set<Long> likes) {
    this.likes = likes;
}

// --- Optional helper methods ---
public void addLike(Long userId) {
    this.likes.add(userId);
}

public void removeLike(Long userId) {
    this.likes.remove(userId);
}

public int getLikeCount() {
    return this.likes.size();
}

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

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        // Generally, you don't want to allow setting createdAt after creation
        // This setter is mostly for JPA, but consider removing it if not needed
        this.createdAt = createdAt;
    }
}