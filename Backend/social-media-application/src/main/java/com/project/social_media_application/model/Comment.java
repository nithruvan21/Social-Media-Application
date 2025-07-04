package com.project.social_media_application.model;

import jakarta.persistence.*; // Import necessary JPA annotations
import java.time.LocalDateTime;

@Entity
@Table(name = "comments") // Name of the database table
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT") // Comment content cannot be null
    private String content;

    @Column(nullable = false, updatable = false) // Timestamp when comment was created
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY) // Link to the Post entity
    @JoinColumn(name = "post_id", nullable = false) // Foreign key column in comments table
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY) // Link to the User entity (author of the comment)
    @JoinColumn(name = "user_id", nullable = false) // Foreign key column in comments table
    private User user;

    // --- Constructors ---

    // Default constructor for JPA
    public Comment() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor for creating a new comment
    public Comment(String content, Post post, User user) {
        this.content = content;
        this.post = post;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---

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

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}