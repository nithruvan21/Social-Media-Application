package com.project.social_media_application.dtos;

public class UserSummaryDTO {
    private Long id;
    private String name;
    private String email;
    // --- ADDED ---
    private String profilePictureUrl; // Field to hold the URL

    // Updated constructor to accept the URL
    public UserSummaryDTO(Long id, String name, String email, String profilePictureUrl) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePictureUrl = profilePictureUrl; // Assign the URL
    }

    // Default constructor (keep)
    public UserSummaryDTO() {}

    // --- Getters ---
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    // --- ADDED Getter ---
    public String getProfilePictureUrl() { return profilePictureUrl; }

    // --- Setters ---
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    // --- ADDED Setter ---
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}