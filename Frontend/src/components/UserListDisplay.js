// Gemini/Frontend/pages/ProfilePage.js (If UserListDisplay is inside)
// OR create/modify Gemini/Frontend/components/UserListDisplay.js

import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Import Link
// --- MUI Imports ---
import PersonIcon from '@mui/icons-material/Person';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton'; // Use ListItemButton for click effect
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// --- End MUI Imports ---

function UserListDisplay({ users, isLoading, error }) {
    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>;
    }
    if (error) {
        return <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>;
    }
    if (!users || users.length === 0) {
        return <Typography sx={{ p: 2, color: 'text.secondary' }}>No users found.</Typography>;
    }

    return (
        <List dense disablePadding>
            {users.map((u) => (
                // Wrap ListItem content with ListItemButton and Link component
                <ListItemButton
                    key={u.id}
                    component={RouterLink} // Use RouterLink for navigation
                    to={`/profile/${u.id}`} // Link to the dynamic profile route
                    divider // Keep the divider
                    sx={{ // Optional: Remove default padding if needed
                        paddingTop: 0.5,
                        paddingBottom: 0.5
                     }}
                >
                    <ListItemAvatar sx={{minWidth: 40}}> {/* Adjust avatar margin/size */}
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            {u.name ? u.name[0].toUpperCase() : <PersonIcon fontSize="small"/>}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={u.name} secondary={u.email} />
                </ListItemButton>
            ))}
        </List>
    );
}

// If UserListDisplay is a separate component, export it:
// export default UserListDisplay;