// Gemini/Frontend/components/PostCard.js
import React, { useEffect, useState } from 'react';
// Import Link from react-router-dom
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ** Ensure useAuth is imported **
import api from '../services/api';
import AddCommentForm from './AddCommentForm'; // Import AddCommentForm
import CommentList from './CommentList'; // Import CommentList

// --- MUI Imports ---
import PersonIcon from '@mui/icons-material/Person'; // Import PersonIcon
import Avatar from '@mui/material/Avatar'; // Import Avatar
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
// --- Add imports for Delete functionality ---
import DeleteIcon from '@mui/icons-material/Delete'; // Icon for delete
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Icon for options menu
import Alert from '@mui/material/Alert'; // For displaying errors
import CircularProgress from '@mui/material/CircularProgress'; // For loading indicator
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
// --- End MUI Imports ---


// --- Basic Styling (Keep previous styles or move to CSS) ---
const cardStyle = {
  marginBottom: '20px',
  border: '1px solid #dbdbdb',
  borderRadius: '15px',
  position: 'relative', // ** Add position relative for menu icon **
};
const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  fontWeight: '600',
  // position: 'relative', // Already added to cardStyle
};
const cardImageStyle = {
  width: '100%',
  display: 'block',
};
const cardActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
};
const cardContentStyle = {
  padding: '0 16px 8px 16px',
};
const tagStyle = {
  color: 'primary.light',
  marginRight: '5px',
  cursor: 'pointer',
  textDecoration: 'none',
  '&:hover': {
      textDecoration: 'underline',
  },
};
const likeButtonStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
  fontSize: '1.5rem', marginRight: '8px', color: 'inherit',
};
const likedButtonStyle = { ...likeButtonStyle, color: 'red' };
const viewCommentsStyle = {
    color: '#888',
    fontSize: '0.9em',
    cursor: 'pointer',
    display: 'block',
    marginTop: '8px',
    marginBottom: '8px',
    padding: '0 16px',
};
const timestampStyle = {
  color: '#888',
  fontSize: '0.8em',
  textTransform: 'uppercase',
  marginTop: '10px',
  marginBottom: '10px',
  padding: '0 16px',
};
// --- Add style for options icon ---
const optionsIconStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1, // Ensure it's clickable over other header elements
};
// --- End Styles ---


// --- PostCard Component ---
// --- Accept onDeleteSuccess prop ---
function PostCard({ post, onDeleteSuccess }) {
  // --- Get current user from AuthContext ---
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(post?.likedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [likeError, setLikeError] = useState('');

  const [showComments, setShowComments] = useState(false);
  const [commentRefreshCounter, setCommentRefreshCounter] = useState(0);

  // --- State for Delete Action ---
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // --- End Delete State ---

  // --- State for Options Menu ---
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  // --- End Menu State ---

  useEffect(() => {
    setIsLiked(post?.likedByCurrentUser || false);
    setLikeCount(post?.likeCount || 0);
  }, [post?.likedByCurrentUser, post?.likeCount, post?.id]);

  if (!post) {
    return null;
  }

  const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A';

  // --- Check if the current user is the author ---
  const isAuthor = isAuthenticated && currentUser?.id === post?.userId;
  // --- End Author Check ---

  const handleLikeToggle = async () => { /* ... (keep existing like logic) ... */
     if (!isAuthenticated || isProcessingLike) {
         if(!isAuthenticated) setLikeError("Please login to like posts.");
         return;
    }
    setIsProcessingLike(true);
    setLikeError('');
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;
    // Optimistic update
    setIsLiked(!originalIsLiked);
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);
    try {
      let response;
      if (originalIsLiked) {
        response = await api.delete(`/posts/${post.id}/like`);
      } else {
        response = await api.post(`/posts/${post.id}/like`);
      }
       // Sync with actual response
       if (response.data) {
           setIsLiked(response.data.likedByCurrentUser);
           setLikeCount(response.data.likeCount);
       } else {
           setIsLiked(originalIsLiked);
           setLikeCount(originalLikeCount);
       }
    } catch (err) {
      console.error("Error toggling like:", err);
      setLikeError("Failed to update like status.");
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    } finally {
      setIsProcessingLike(false);
    }
  };

  const handleCommentAdded = (newComment) => { /* ... (keep existing comment logic) ... */
    console.log("New comment added in PostCard:", newComment);
    setCommentRefreshCounter(prev => prev + 1);
    if (!showComments) {
        setShowComments(true);
    }
  };

  // --- Menu Handling Functions ---
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  // --- End Menu Handling ---

  // --- DELETE POST Handling Function ---
  const handleDeletePost = async () => {
    handleMenuClose(); // Close menu after clicking delete
    setDeleteError('');

    // Confirmation dialog
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    setIsDeleting(true);
    try {
        // Call backend DELETE endpoint
        await api.delete(`/posts/${post.id}`);
        console.log(`Post ${post.id} deleted successfully.`);
        // Notify parent component to remove the post from the list
        if (onDeleteSuccess) {
            onDeleteSuccess(post.id); // Pass the ID of the deleted post
        }
        // Component will likely unmount, no need to reset isDeleting here
    } catch (err) {
        console.error("Error deleting post:", err);
        let errMsg = "Failed to delete post.";
        if (err.response?.status === 403) {
            errMsg = "You are not authorized to delete this post.";
        } else if (err.response?.status === 404) {
            errMsg = "Post not found.";
        }
        setDeleteError(errMsg);
        setIsDeleting(false); // Reset loading state only on error
    }
  };
  // --- End DELETE POST ---


  return (
    <div style={cardStyle}> {/* Ensure position: 'relative' is here */}
      {/* Card Header */}
      <div style={cardHeaderStyle}>
          <Avatar
            src={post.userProfilePictureUrl}
            sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'secondary.light' }}
          >
             {post.userName ? post.userName[0].toUpperCase() : <PersonIcon fontSize="small"/>}
          </Avatar>
          <span>{post.userName || 'Unknown User'}</span>

          {/* --- Options Menu Button (Only for Author) --- */}
          {isAuthor && !isDeleting && (
             <>
                <IconButton
                    aria-label="Post options"
                    aria-controls={openMenu ? 'post-options-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleMenuClick}
                    size="small"
                    sx={optionsIconStyle} // Apply positioning style
                 >
                     <MoreVertIcon fontSize="inherit"/> {/* Use inherit size */}
                </IconButton>
                <Menu
                    id="post-options-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    MenuListProps={{ 'aria-labelledby': 'post-options-button' }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    // Optional: style the menu paper
                    // PaperProps={{ sx: { boxShadow: 3, borderRadius: 1 } }}
                >
                    {/* Add Edit option later if needed */}
                    {/* <MenuItem onClick={() => {/* handle edit * / handleMenuClose(); }}>Edit</MenuItem> */}
                    <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }}/> Delete
                    </MenuItem>
                </Menu>
             </>
          )}
          {/* --- Show deleting indicator instead of button --- */}
          {isAuthor && isDeleting && <CircularProgress size={20} sx={optionsIconStyle} />}
          {/* --- End Options Menu --- */}
      </div>

      {/* --- Display Delete Error near header --- */}
      {deleteError && <Alert severity="error" sx={{ m: 1, mb: 0, fontSize: '0.9em' }}>{deleteError}</Alert>}
      {/* --- End Delete Error Display --- */}


      {/* Card Image */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post content" style={cardImageStyle} />
      )}

      {/* Card Actions */}
      <div style={cardActionsStyle}>
        <button
          onClick={handleLikeToggle}
          disabled={isProcessingLike || !isAuthenticated}
          style={isLiked ? likedButtonStyle : likeButtonStyle}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          {isLiked ? '❤️' : '♡'}
        </button>
        <button style={likeButtonStyle} onClick={() => setShowComments(!showComments)} aria-label="Show comments">💬</button>
        {/* <button style={likeButtonStyle}>➢</button> */}
      </div>

      {/* Like Count */}
      {likeCount > 0 && (
        <div style={{ padding: '0 16px', fontWeight: '600', marginBottom: '8px' }}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </div>
      )}
       {/* Display Like Error */}
       {likeError && <p style={{ color: 'red', fontSize: '0.8em', padding: '0 16px' }}>{likeError}</p>}


      {/* Card Content - Tags */}
      <Box sx={cardContentStyle}>
          {/* Post Caption/Text */}
          <Typography variant="body2" component="p" sx={{ mb: 1 }}>
            <strong style={{ marginRight: '5px' }}>{post.userName || 'Unknown User'}</strong>
            {post.content}
          </Typography>

          {/* Tags Section - Now with Links */}
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ marginTop: '5px' }}>
                {post.tags.map((tag, index) => (
                    <Link
                        key={index}
                        component={RouterLink}
                        to={`/tags/${encodeURIComponent(tag)}`}
                        sx={tagStyle}
                    >
                        #{tag}
                    </Link>
                ))}
            </Box>
          )}
      </Box>

       {/* View Comments Toggle/Link */}
        <div
            style={viewCommentsStyle}
            onClick={() => setShowComments(!showComments)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setShowComments(!showComments)}
            >
            {showComments ? 'Hide comments' : 'View comments'}
        </div>


      {/* Comments Section (Conditional Rendering) */}
      {showComments && (
        <div style={{ padding: '0 16px' }}>
          <CommentList postId={post.id} refreshCounter={commentRefreshCounter} />
        </div>
      )}

      {/* Timestamp */}
      <div style={timestampStyle}>
        {formattedDate}
      </div>

      {/* Add Comment Form */}
      {isAuthenticated && (
         <AddCommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
      )}

    </div>
  );
}

export default PostCard;