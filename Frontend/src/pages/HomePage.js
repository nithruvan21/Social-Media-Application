// Gemini/Frontend/pages/HomePage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Use named import
import PostList from '../components/PostList';
import { useAuth } from '../contexts/AuthContext';

// --- MUI Imports ---
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link'; // MUI Link
import Typography from '@mui/material/Typography';
// --- End MUI Imports ---

function HomePage() {
    const { isAuthenticated, user, isLoading } = useAuth();

    // --- Logged-In View ---
    if (isLoading && !user) { // Show loading only if user isn't loaded yet
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (isAuthenticated) {
        return (
            // Centered Post List Container for logged-in users
            <Box sx={{ maxWidth: '700px', /* Adjusted maxWidth */ margin: '0 auto' }}> {/* Removed top margin as AppBar has bottom margin */}
                 {/* === MODIFICATION HERE === */}
                 {/* Pass feedType="feed" to show followed users' posts */}
                <PostList feedType="feed" />
                 {/* === END MODIFICATION === */}
            </Box>
        );
    }

    // --- Logged-Out View (New Styling) ---
    // Note: Make sure your AppBar height is considered if setting minHeight to 100vh
    const appBarHeight = '64px'; // Adjust if your AppBar height is different

    return (
        <Box
            sx={{
                minHeight: `calc(100vh - ${appBarHeight})`, // Full viewport height minus app bar
                width: '100vw', // Full viewport width
                position: 'relative', // Needed for absolute positioning of text box if required
                marginLeft: '-50vw', // Center the full-width box relative to viewport
                left: '50%',
                display: 'flex',
                alignItems: 'center', // Vertically center content
                justifyContent: 'center', // Horizontally center content
                // --- Background Image Styling ---
                backgroundImage: `url(${process.env.PUBLIC_URL}/images/first_bg.jpg)`, // Path relative to public folder
                backgroundSize: 'cover', // Cover the entire area
                backgroundPosition: 'center center', // Center the image
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed', // Keep background fixed during scroll (optional)
            }}
        >
            {/* --- Blurred Background Box for Text --- */}
            <Box
                sx={{
                    padding: { xs: 3, sm: 4 }, // Responsive padding
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark background
                    backdropFilter: 'blur(8px)', // Apply blur effect
                    borderRadius: '12px', // Rounded corners
                    textAlign: 'center',
                    maxWidth: '90%', // Max width relative to parent
                    width: { xs: '90%', sm: 'auto' }, // Responsive width
                    color: 'white', // Ensure text is white
                    boxShadow: 3, // Optional shadow for depth
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome to CollegeConnect!
                </Typography>
                <Typography variant="h6" component="p">
                    Please{' '}
                    <Link component={RouterLink} to="/login" color="primary.light" /* Lighter link color on dark bg */ sx={{ fontWeight: 'bold' }}>
                        login
                    </Link>
                    {' '}to see posts and connect with others.
                </Typography>
            </Box>
        </Box>
    );
}

export default HomePage;