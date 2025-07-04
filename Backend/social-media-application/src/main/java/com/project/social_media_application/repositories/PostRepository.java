package com.project.social_media_application.repositories;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.social_media_application.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Find posts by the User object's ID
    // Spring Data JPA automatically generates the query based on the method name
    // findByUser_Id -> find posts where the 'user' field's 'id' property matches
    List<Post> findByUserId(Long userId);

    // Optional: If you want ordering directly in the query
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findByUser_IdInOrderByCreatedAtDesc(Collection<Long> userIds);
    // Optional: Using a custom query with JOIN FETCH to potentially avoid N+1 issues
    // when loading posts and their users together (e.g., in getAllPosts)
    // @Query("SELECT p FROM Post p JOIN FETCH p.user ORDER BY p.createdAt DESC")
    // List<Post> findAllWithUserOrderByCreatedAtDesc();

    @Query("SELECT p FROM Post p WHERE :tag MEMBER OF p.tags ORDER BY p.createdAt DESC")
    List<Post> findByTag(@Param("tag") String tag);
}