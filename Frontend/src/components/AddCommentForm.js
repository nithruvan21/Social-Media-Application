import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Basic styling
const formStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px', // Match PostCard padding
    borderTop: '1px solid #efefef', // Separator like Insta
    marginTop: '10px',
};

const inputStyle = {
    flexGrow: 1, // Take up available space
    border: 'none',
    outline: 'none',
    padding: '8px 0', // Adjust padding as needed
    marginRight: '10px',
    fontSize: '0.9em',
    backgroundColor: 'transparent', // Blend with background
};

const buttonStyle = {
    background: 'none',
    border: 'none',
    color: '#0095f6', // Instagram blue
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 0', // Match input padding roughly
    fontSize: '0.9em',
};

const disabledButtonStyle = {
    ...buttonStyle,
    color: '#b2dffc', // Lighter blue when disabled
    cursor: 'default',
};

function AddCommentForm({ postId, onCommentAdded }) { // Receive postId and callback
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth(); // Check if user is logged in

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent page reload

        if (!isAuthenticated) {
            setError("Please login to comment.");
            return;
        }

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            // Don't submit empty comments, maybe show subtle feedback later
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // POST /api/posts/{postId}/comments
            // Body needs to match CommentRequest DTO: { "content": "..." }
            const response = await api.post(`/posts/${postId}/comments`, { content: trimmedContent });

            console.log("Comment added:", response.data);
            setContent(''); // Clear the input field on success
            if (onCommentAdded) {
                onCommentAdded(response.data); // Call the callback to notify parent
            }

        } catch (err) {
            console.error("Error adding comment:", err);
            setError("Failed to post comment.");
            // Don't clear content on error so user can retry
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            {/* Optional: Add user avatar placeholder here */}
            <input
                type="text"
                style={inputStyle}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment..."
                disabled={!isAuthenticated || isSubmitting} // Disable if not logged in or submitting
                aria-label="Add a comment"
            />
            <button
                type="submit"
                style={!content.trim() || isSubmitting || !isAuthenticated ? disabledButtonStyle : buttonStyle}
                disabled={!content.trim() || isSubmitting || !isAuthenticated} // Disable if no text or submitting
            >
                Post
            </button>
             {/* Display small error message below form if needed */}
             {/* {error && <p style={{ color: 'red', fontSize: '0.8em', width: '100%', textAlign: 'center', marginTop: '5px' }}>{error}</p>} */}
        </form>
    );
}

export default AddCommentForm;