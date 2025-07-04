import React from 'react';

// Basic styling (can be moved to CSS)
const commentStyle = {
    marginBottom: '8px',
    fontSize: '0.9em',
    lineHeight: '1.4',
};

const userNameStyle = {
    fontWeight: '600',
    marginRight: '6px',
};

const timestampStyle = {
    color: '#888',
    fontSize: '0.8em',
    marginLeft: '10px',
};


function CommentItem({ comment }) {
    if (!comment) {
        return null;
    }

    // Basic date formatting
    const formattedDate = comment.createdAt
        ? new Date(comment.createdAt).toLocaleString()
        : '';

    return (
        <div style={commentStyle}>
            <span style={userNameStyle}>{comment.userName || 'Unknown User'}</span>
            <span>{comment.content}</span>
            <span style={timestampStyle}>{formattedDate}</span>
             {/* Add delete button later if needed and authorized */}
             {/* <button>Delete</button> */}
        </div>
    );
}

export default CommentItem;