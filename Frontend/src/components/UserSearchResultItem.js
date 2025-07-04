import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// MUI Imports
import Alert from '@mui/material/Alert'; // For displaying errors
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
// Optional: Add icons for follow/unfollow buttons
// import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

// User data here matches the UserSummaryDTO from backend
function UserSearchResultItem({ user }) {
    const { user: currentUser, isAuthenticated } = useAuth(); // Get current logged-in user
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    // We don't know the initial follow state here yet without extra data
    // So the button will just attempt the action

    if (!user) return null;

    // Don't show follow button for the current user themselves
    const isCurrentUser = currentUser?.id === user.id;

    const handleFollow = async () => {
        if (!isAuthenticated || isCurrentUser || isProcessing) return;
        setIsProcessing(true);
        setError('');
        try {
            // POST /api/users/{userIdToFollow}/follow
            await api.post(`/user/${user.id}/follow`);
            console.log(`Followed user ${user.id}`);
            // Ideally, update UI state here to show "Following"
            // but we lack the initial state. Need to refetch or manage state globally.
        } catch (err) {
            console.error("Error following user:", err);
            setError(`Failed to follow ${user.name}.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnfollow = async () => {
        if (!isAuthenticated || isCurrentUser || isProcessing) return;
        setIsProcessing(true);
        setError('');
        try {
            // DELETE /api/users/{userIdToUnfollow}/follow
            await api.delete(`/user/${user.id}/follow`);
            console.log(`Unfollowed user ${user.id}`);
             // Ideally, update UI state here to show "Follow"
        } catch (err) {
            console.error("Error unfollowing user:", err);
            setError(`Failed to unfollow ${user.name}.`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ListItem
            divider // Adds a line separator between items
            secondaryAction={ // Content aligned to the end of the ListItem
                !isCurrentUser && isAuthenticated && ( // Only show buttons if logged in and not self
                    <Box sx={{ display: 'flex', gap: 1 }}>
                         {/* Simple Follow/Unfollow buttons for now */}
                         {/* A better approach would fetch current following status */}
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleFollow}
                            disabled={isProcessing}
                            // startIcon={isProcessing ? <CircularProgress size={16}/> : <PersonAddIcon />}
                         >
                            Follow
                        </Button>
                         <Button
                            size="small"
                            variant="outlined"
                            color="secondary" // Or 'inherit'
                            onClick={handleUnfollow}
                            disabled={isProcessing}
                            // startIcon={isProcessing ? <CircularProgress size={16}/> : <PersonRemoveIcon />}
                         >
                            Unfollow
                        </Button>
                    </Box>
                )
            }
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {/* Placeholder Avatar */}
                    {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={user.name || 'Unknown User'}
                secondary={user.email || 'No email'} // Display email from UserSummaryDTO
            />
             {/* Display small error message within the item if needed */}
             {error && <Alert severity="error" sx={{ ml: 2, fontSize: '0.8em', padding: '0 5px' }}>{error}</Alert>}
        </ListItem>
    );
}

export default UserSearchResultItem;