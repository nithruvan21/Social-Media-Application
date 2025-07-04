import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CommentItem from './CommentItem';

// Basic styling
const listStyle = {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #efefef', // Light separator
};

function CommentList({ postId, refreshCounter }) { // Accept postId and a refresh trigger
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!postId) return; // Don't fetch if postId is not provided

        const fetchComments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // GET /api/posts/{postId}/comments
                const response = await api.get(`/posts/${postId}/comments`);
                if (Array.isArray(response.data)) {
                    setComments(response.data);
                } else {
                    console.error("Invalid comment data received:", response.data);
                    setComments([]);
                    setError("Failed to load comments due to invalid data format.");
                }
            } catch (err) {
                console.error(`Error fetching comments for post ${postId}:`, err);
                setError("Could not load comments.");
                setComments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();

        // Rerun fetchComments if postId changes OR if refreshCounter changes
    }, [postId, refreshCounter]);

    if (isLoading) {
        return <div style={{fontSize: '0.9em', color: '#888'}}>Loading comments...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', fontSize: '0.9em' }}>{error}</div>;
    }

    // Don't show the list container if there are no comments (optional)
    // if (comments.length === 0) {
    //     return <div style={{fontSize: '0.9em', color: '#888', marginTop: '10px'}}>No comments yet.</div>;
    // }

    return (
        <div style={listStyle}>
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))
            ) : (
                 <div style={{fontSize: '0.9em', color: '#888'}}>No comments yet.</div>
            )}
        </div>
    );
}

export default CommentList;