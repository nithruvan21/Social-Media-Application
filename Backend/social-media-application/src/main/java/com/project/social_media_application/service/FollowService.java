package com.project.social_media_application.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.social_media_application.dtos.UserSummaryDTO;
import com.project.social_media_application.model.User;
import com.project.social_media_application.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class FollowService {
    @Autowired
    private UserRepository userRepository;

    public void followUser(Long followerId, Long followingId){
        if(followerId.equals(followingId)){
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new EntityNotFoundException("Follower user not found with ID: "+followerId));
        
        User following = userRepository.findById(followingId)
            .orElseThrow(() -> new EntityNotFoundException("Following user not found with ID: "+followingId));

        follower.addFollowing(following);

        userRepository.save(follower);
    }

    public void removeFollowing(Long followerId, Long followingId){
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new EntityNotFoundException("Follower user not found with ID: "+followerId));
        
        User following = userRepository.findById(followingId)
            .orElseThrow(() -> new EntityNotFoundException("Following user not found with ID: "+followingId));
        
        follower.removeFollowing(following);
        userRepository.save(follower);
    }

    // // ... inside FollowService class ...

// Helper method to convert User to UserSummaryDTO
// (Ensure UserSummaryDTO has appropriate constructor/setters)
private UserSummaryDTO convertToSummaryDTO(User user) {
     if (user == null) return null;
     // Assuming UserSummaryDTO constructor (Long id, String name, String email)
     return new UserSummaryDTO(user.getId(), user.getName(), user.getEmail(),user.getProfilePictureUrl());
     // Add profile pic mapping later if needed
}

@Transactional(readOnly = true) // readOnly = true as we are just reading
public List<UserSummaryDTO> getFollowing(Long userId) {
    // Find the user
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

    // Access the lazily-loaded 'following' set within the transaction
    // Convert the Set<User> to List<UserSummaryDTO>
    return user.getFollowing().stream()
            .map(this::convertToSummaryDTO)
            .collect(Collectors.toList());
}

@Transactional(readOnly = true) // readOnly = true as we are just reading
public List<UserSummaryDTO> getFollowers(Long userId) {
    // Find the user
     User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

    // Access the lazily-loaded 'followers' set within the transaction
    // Convert the Set<User> to List<UserSummaryDTO>
    return user.getFollowers().stream()
            .map(this::convertToSummaryDTO)
            .collect(Collectors.toList());
}
}
