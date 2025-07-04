// Gemini/Frontend/pages/ProfilePage.js
import React, { useCallback, useEffect, useState } from 'react';
// --- Remove Navigate if not used elsewhere after auth check ---
// import { Navigate } from 'react-router-dom';
import PostCard from '../components/PostCard'; // Import PostCard to display posts
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// --- MUI Imports ---
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// --- MUI Icons ---
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SaveIcon from '@mui/icons-material/Save';
import SchoolIcon from '@mui/icons-material/School';
// --- End MUI Imports ---

// --- UserListDisplay Component ---
// Assuming UserListDisplay component is defined here or imported correctly
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
                // --- Assuming ListItemButton is correctly configured ---
                <ListItemButton key={u.id} /* component={RouterLink} to={`/profile/${u.id}`} */ divider>
                    <ListItemAvatar sx={{minWidth: 40}}>
                        <Avatar
                            src={u.profilePictureUrl} // Use the src prop
                            sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}
                        >
                            {u.name ? u.name[0].toUpperCase() : <PersonIcon fontSize="small"/>}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={u.name} secondary={u.email} />
                </ListItemButton>
                 // --- End Assuming ---
            ))}
        </List>
    );
}


// --- ProfileDisplay Component ---
function ProfileDisplay({ user, onEdit }) {
     if (!user) return <p>User data not available.</p>;

    const profileItems = [
        { icon: <PersonIcon />, primary: 'Name', secondary: user.name || 'N/A' },
        { icon: <EmailIcon />, primary: 'Email', secondary: user.email || 'N/A' },
        { icon: <SchoolIcon />, primary: 'Department', secondary: user.department || 'Not set' },
        { icon: <CalendarTodayIcon />, primary: 'Year of Study', secondary: user.studyYear || 'Not set' },
        { icon: <PhoneIcon />, primary: 'Contact Number', secondary: user.contactNumber || 'Not set' },
        { icon: <HomeIcon />, primary: 'Address', secondary: user.address || 'Not set' },
    ];

    return (
        <>
            <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
                src={user.profilePictureUrl} // Use the src prop
                sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
                >
                {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
            </Avatar>
            <Typography variant="h5" component="div">
                {user.name}'s Profile
            </Typography>
            </Box>
                <List dense>
                    {profileItems.map((item, index) => (
                         item.secondary && item.secondary !== 'N/A' && item.secondary !== 'Not set' ? (
                            <ListItem key={index} disablePadding>
                                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.primary} secondary={item.secondary} />
                            </ListItem>
                        ) : null
                    ))}
                </List>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Button size="small" onClick={onEdit} startIcon={<EditIcon />}>Edit Profile</Button>
            </CardActions>
        </>
    );
}

// --- ProfileEditForm Component ---
function ProfileEditForm({ initialUser, onSave, onCancel }) {
    const [formData, setFormData] = useState(() => ({
        name: initialUser?.name || '',
        department: initialUser?.department || '',
        studyYear: initialUser?.studyYear || '',
        contactNumber: initialUser?.contactNumber || '',
        address: initialUser?.address || '',
    }));
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const updateData = { ...formData };
            await api.put('/user/update', updateData);
            onSave(updateData); // Call onSave passed from parent
        } catch (err) {
             console.error("Error updating profile:", err);
             let errorMsg = "Failed to update profile.";
             if (err.response) { errorMsg = `Error: ${err.response.status}. ${err.response.data?.error || err.response.data?.message || 'Server error'}`; }
             else if (err.request) { errorMsg = "Error: No response from server."; }
             else { errorMsg = `Error: ${err.message}`; }
             setError(errorMsg);
             setIsSaving(false);
        }
        // No need to set saving false on success if parent handles state change/navigation
    };

    return (
        <Card sx={{ minWidth: 275, mt: 3 }}>
             <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                 <CardContent>
                     <Typography variant="h5" component="div" sx={{ mb: 2 }}>Edit Profile</Typography>
                     {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                     <TextField margin="normal" required fullWidth autoFocus id="name" label="Name" name="name" value={formData.name} onChange={handleChange} disabled={isSaving} />
                     <TextField margin="normal" fullWidth id="department" label="Department" name="department" value={formData.department} onChange={handleChange} disabled={isSaving} />
                     <TextField margin="normal" fullWidth id="studyYear" label="Year of Study" name="studyYear" value={formData.studyYear} onChange={handleChange} disabled={isSaving} />
                     <TextField margin="normal" fullWidth id="contactNumber" label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} disabled={isSaving} />
                     <TextField margin="normal" fullWidth multiline rows={3} id="address" label="Address" name="address" value={formData.address} onChange={handleChange} disabled={isSaving} />
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                     <Button onClick={onCancel} disabled={isSaving} startIcon={<CancelIcon />} color="inherit">Cancel</Button>
                     <Button type="submit" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} variant="contained">{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                 </CardActions>
             </Box>
        </Card>
    );
}


// --- Main Profile Page ---
function ProfilePage() {
    const { user, isAuthenticated, isLoading, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // State for followers/following
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [listLoading, setListLoading] = useState({ followers: false, following: false });
    const [listError, setListError] = useState({ followers: '', following: '' });
    const [activeTab, setActiveTab] = useState(0); // Default to followers tab

    // State for user's posts
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true); // Start loading true
    const [postsError, setPostsError] = useState('');

    // Combined useEffect for fetching lists and posts
    useEffect(() => {
        // Ensure user is loaded and has an ID before fetching
        if (user?.id) {
            const fetchData = async () => {
                // --- Fetch Followers ---
                setListLoading(prev => ({ ...prev, followers: true }));
                setListError(prev => ({ ...prev, followers: '' }));
                try {
                    const resFollowers = await api.get(`/user/${user.id}/followers`);
                    setFollowers(resFollowers.data);
                } catch (err) {
                    console.error("Error fetching followers:", err);
                    setListError(prev => ({ ...prev, followers: 'Failed to load followers.' }));
                } finally {
                    setListLoading(prev => ({ ...prev, followers: false }));
                }

                // --- Fetch Following ---
                setListLoading(prev => ({ ...prev, following: true }));
                setListError(prev => ({ ...prev, following: '' }));
                try {
                    const resFollowing = await api.get(`/user/${user.id}/following`);
                    setFollowing(resFollowing.data);
                } catch (err) {
                    console.error("Error fetching following:", err);
                    setListError(prev => ({ ...prev, following: 'Failed to load following list.' }));
                } finally {
                    setListLoading(prev => ({ ...prev, following: false }));
                }

                // --- Fetch User Posts ---
                setPostsLoading(true); // Set loading true before fetch
                setPostsError('');
                try {
                    // Use the /my-posts endpoint
                    const resPosts = await api.get('/posts/my-posts');
                    if (Array.isArray(resPosts.data)) {
                        setUserPosts(resPosts.data);
                    } else {
                        setUserPosts([]);
                        setPostsError("Invalid post data received.");
                    }
                } catch (err) {
                    console.error("Error fetching user posts:", err);
                    setPostsError('Failed to load your posts.');
                } finally {
                    setPostsLoading(false); // Set loading false after fetch attempt
                }
            };
            fetchData();
        } else if (!isLoading) {
            // If user context is loaded but no user.id, stop loading posts
            setPostsLoading(false);
        }
    }, [user?.id, isLoading]); // Depend on user.id and the main isLoading flag


    const handleSaveProfile = useCallback((updatedData) => {
        const currentToken = localStorage.getItem('jwtToken');
        if (currentToken) { login(currentToken); } // Refresh user data in context
        setIsEditing(false);
    }, [login]);

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleCancel = useCallback(() => setIsEditing(false), []);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);


    // --- ADD Handler for successful deletion on profile page ---
    const handleDeleteSuccessOnProfile = (deletedPostId) => {
        setUserPosts(currentPosts => currentPosts.filter(p => p.id !== deletedPostId));
        console.log(`ProfilePage: Removed post ${deletedPostId} from list.`);
    };
    // --- End Handler ---


    // --- Loading and Auth Checks ---
    if (isLoading && !user) { // Show loading only if main auth check is in progress
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!isAuthenticated) { // Redirect if auth check finished and user is not authenticated
        // ** Import Navigate if you uncomment this **
        // return <Navigate to="/login" replace />;
        // Or display a message/login prompt
        return <Typography sx={{ textAlign: 'center', mt: 4 }}>Please login to view your profile.</Typography>;
    }

    // --- Render Profile Page ---
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '700px' }, mt: 2 }}>

                {/* 1. Profile Details / Edit Form Card */}
                <Card sx={{ mb: 3 }}>
                     {user ? ( // Check if user data is available (it should be if authenticated)
                         isEditing ? (
                             <ProfileEditForm initialUser={user} onSave={handleSaveProfile} onCancel={handleCancel} />
                         ) : (
                             <ProfileDisplay user={user} onEdit={handleEdit} />
                         )
                     ) : (
                          <Box sx={{display: 'flex', justifyContent: 'center', p:2}}><CircularProgress /></Box> // Show spinner if user somehow null while auth=true
                     )}
                </Card>

                {/* 2. Followers/Following Card (Only show when not editing and user exists) */}
                {!isEditing && user && (
                    <Card sx={{ mb: 3 }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                                <Tab label={`Followers (${followers?.length ?? 0})`} sx={{fontSize: '0.9rem', minWidth: 'auto'}}/>
                                <Tab label={`Following (${following?.length ?? 0})`} sx={{fontSize: '0.9rem', minWidth: 'auto'}}/>
                            </Tabs>
                        </Box>
                        <Box>
                            {/* Conditionally render UserListDisplay based on activeTab */}
                            {activeTab === 0 && <UserListDisplay users={followers} isLoading={listLoading.followers} error={listError.followers}/>}
                            {activeTab === 1 && <UserListDisplay users={following} isLoading={listLoading.following} error={listError.following}/>}
                        </Box>
                    </Card>
                )}

                {/* 3. User Posts Section */}
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom component="div" sx={{ textAlign: 'center', mb: 2 }}>
                        Your Posts
                    </Typography>
                    {/* Posts Content */}
                    {postsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
                    {postsError && <Alert severity="error" sx={{ my: 2 }}>{postsError}</Alert>}
                    {!postsLoading && !postsError && userPosts.length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                            You haven't posted anything yet.
                        </Typography>
                    )}
                    {!postsLoading && !postsError && userPosts.length > 0 && (
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                           {userPosts.map(post => (
                               // --- PASS onDeleteSuccess prop down to PostCard ---
                               <PostCard
                                   key={post.id}
                                   post={post}
                                   onDeleteSuccess={handleDeleteSuccessOnProfile} // Pass the handler
                               />
                               // --- End Prop Passing ---
                           ))}
                       </Box>
                    )}
                </Box>

            </Box> {/* End of centering Box */}
        </Box> // End of main container Box
    );
}

export default ProfilePage;