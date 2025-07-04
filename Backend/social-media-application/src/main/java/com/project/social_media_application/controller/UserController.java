package com.project.social_media_application.controller;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.social_media_application.Utitlity.JwtUtil;
import com.project.social_media_application.dtos.UserSummaryDTO;
import com.project.social_media_application.model.User;
import com.project.social_media_application.repositories.UserRepository;
import com.project.social_media_application.service.FollowService;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/user")
// @CrossOrigin
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FollowService followService;

    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody User updatedUser) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();

        user.setName(updatedUser.getName());
        user.setAddress(updatedUser.getAddress());
        user.setContactNumber(updatedUser.getContactNumber());
        user.setDepartment(updatedUser.getDepartment());
        user.setStudyYear(updatedUser.getStudyYear());

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }

    private Long getCurrentUserId(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")){
            throw new IllegalArgumentException("User not Authenticated");
        }
        String userEmail;
        Object principal = authentication.getPrincipal();
        
        if(principal instanceof UserDetails){
            userEmail = ((UserDetails) principal).getUsername();
        }else if(principal instanceof String){
            userEmail = (String) principal;
        }else{
            throw new IllegalArgumentException("Unexpected principal type: " + principal.getClass());
        }
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found in Database"+ userEmail));
        return user.getId();
    }

    @PostMapping("/{userIdToFollow}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long userIdToFollow){
        try{
            Long followerId = getCurrentUserId();
            followService.followUser(followerId, userIdToFollow);
            return ResponseEntity.ok().body("User Followed Successfully");
        }catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) { // Catch self-follow attempts
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // Log the exception e.g., logger.error("Error following user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to follow user.");
        }
    }

    @DeleteMapping("{UserIdToUnfollow}/follow")
    public ResponseEntity<?> unfollowUser(@PathVariable Long UserIdToUnfollow){
        try{
            Long followerId = getCurrentUserId();
            followService.removeFollowing(followerId, UserIdToUnfollow);
            return ResponseEntity.ok().body("User unfollowed successfully.");
        }catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
             // Log the exception e.g., logger.error("Error unfollowing user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to unfollow user.");
        }
    }

    private UserSummaryDTO convertToUserSummaryDTO(User user){
        if (user == null) {
            return null;
        }

        return new UserSummaryDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfilePictureUrl()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam("query") String query){
        if(query == null || query.trim().isEmpty()){
            return ResponseEntity.badRequest().body("Search query cannot be empty.");
        }
        System.out.println("Search name:"+ query);
        try{
            List<User> foundUsers = userRepository.findByNameContainingIgnoreCase(query.trim());

            List<UserSummaryDTO> results = foundUsers.stream()
                .map(this::convertToUserSummaryDTO)
                .collect(Collectors.toList());
            
                return ResponseEntity.ok(results);
        }catch (Exception e) {
            // Log the exception e.g., logger.error("Error searching users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while searching users.");
        }
    }

    @GetMapping("{userId}/following")
    public ResponseEntity<?> getUserFollowing(@PathVariable Long userId){
        try{
            List<UserSummaryDTO> followingList = followService.getFollowing(userId);
            return ResponseEntity.ok(followingList);
        }catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Log the exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving the following list.");
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getUserFollowers(@PathVariable Long userId) {
        try {
            List<UserSummaryDTO> followerList = followService.getFollowers(userId);
            return ResponseEntity.ok(followerList);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
        // Log the exception
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving the follower list.");
    }
}
}
