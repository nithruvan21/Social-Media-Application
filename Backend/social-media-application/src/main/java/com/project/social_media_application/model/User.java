package com.project.social_media_application.model;


import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true)
    private String email;

    private String password;

    private String department;
    private String studyYear;
    private String dateOfBirth;
    private String studentId;
    private String contactNumber;
    private String address;
    @Column(length = 512) // Allow enough space for potentially long URLs
    private String profilePictureUrl;
    // --- End NEW FIELD ---
    // ... inside the User class ...

// Set of users that this user is following
@ManyToMany(fetch = FetchType.LAZY) // LAZY is crucial for performance here
@JoinTable(
        name = "user_following", // Name of the intermediate table
        joinColumns = @JoinColumn(name = "user_id"), // Column linking to this user (the follower)
        inverseJoinColumns = @JoinColumn(name = "following_id") // Column linking to the user being followed
)
@JsonIgnoreProperties({"following", "followers"}) // Prevent infinite loops during JSON serialization
private Set<User> following = new HashSet<>();

// Set of users that are following this user
@ManyToMany(mappedBy = "following", fetch = FetchType.LAZY) // Mapped by the 'following' field in the owning side
@JsonIgnoreProperties({"following", "followers"}) // Prevent infinite loops during JSON serialization
private Set<User> followers = new HashSet<>();

// --- Add Getters and Setters for following and followers ---

public Set<User> getFollowing() {
    return following;
}

public void setFollowing(Set<User> following) {
    this.following = following;
}

public Set<User> getFollowers() {
    return followers;
}

public void setFollowers(Set<User> followers) {
    this.followers = followers;
}

// --- Optional: Helper methods ---
public void addFollowing(User userToFollow) {
    this.following.add(userToFollow);
    // Optionally manage the inverse side automatically if needed, though usually handled by service layer
    // userToFollow.getFollowers().add(this);
}

public void removeFollowing(User userToUnfollow) {
    this.following.remove(userToUnfollow);
     // Optionally manage the inverse side automatically if needed
    // userToUnfollow.getFollowers().remove(this);
}

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStudyYear() {
        return studyYear;
    }

    public void setStudyYear(String studyYear) {
        this.studyYear = studyYear;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    
}
