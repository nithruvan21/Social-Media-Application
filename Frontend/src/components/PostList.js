// Gemini/Frontend/components/PostList.js
import Alert from '@mui/material/Alert'; // For errors
import Box from '@mui/material/Box'; // Import Box for centering progress
import CircularProgress from '@mui/material/CircularProgress'; // Import progress indicator
import Typography from '@mui/material/Typography'; // For messages
import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Use our configured axios instance
import PostCard from './PostCard';

// Accept a prop to determine which endpoint to call
function PostList({ feedType = 'all' }) { // Default to 'all', can be 'feed'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      setPosts([]); // Clear previous posts

      // Determine the endpoint based on the prop
      const endpoint = feedType === 'feed' ? '/posts/feed' : '/posts'; // Use /posts/feed for the followed feed

      try {
        console.log(`Workspaceing posts from: ${endpoint}`); // Log endpoint
        const response = await api.get(endpoint); // Use the determined endpoint

        if (Array.isArray(response.data)) {
             setPosts(response.data);
        } else {
             console.error("API response is not an array:", response.data);
             setError("Received invalid data format from server.");
        }

      } catch (err) {
        console.error(`Error fetching posts from ${endpoint}:`, err);
        if (err.response) {
          setError(`Failed to fetch posts. Status: ${err.response.status}. ${err.response.data?.message || ''}`);
        } else if (err.request) {
          setError("Failed to fetch posts. No response from server.");
        } else {
          setError(`Failed to fetch posts. Error: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [feedType]); // Re-fetch if feedType changes


  // --- ADD Handler for successful deletion ---
  // This function will be called by PostCard when a post is deleted
  const handleDeleteSuccess = (deletedPostId) => {
    // Update the posts state by removing the post with the matching ID
    setPosts(currentPosts => currentPosts.filter(p => p.id !== deletedPostId));
    console.log(`PostList: Removed post ${deletedPostId} from list.`);
  };
  // --- End Handler ---


  if (isLoading) {
    // Center the loading indicator
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>; // Display error nicely
  }

  // Render "no posts" message only if not loading and posts array is empty
  if (!isLoading && posts.length === 0) {
    return (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
            {feedType === 'feed'
                ? "No posts from users you follow yet. Follow some users to see their posts here!"
                : "No posts found." // Generic message for 'all' or other types
            }
        </Typography>
    );
  }

  // Render the list of posts using PostCard
  return (
    // Use Box for consistent spacing if needed
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.map((post) => (
            // --- PASS onDeleteSuccess prop down to PostCard ---
            <PostCard
                key={post.id}
                post={post}
                onDeleteSuccess={handleDeleteSuccess} // Pass the handler function
            />
            // --- End Prop Passing ---
        ))}
    </Box>
  );
}

export default PostList;