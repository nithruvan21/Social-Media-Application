import { Route, BrowserRouter as Router, Link as RouterLink, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CreatePostPage from './pages/CreatePostPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';

// --- Corrected MUI Imports ---
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar'; // Import Avatar
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';

import Toolbar from '@mui/material/Toolbar';
import { grey } from '@mui/material/colors'; // Import specific color 'grey'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TagResultsPage from './pages/TagResultsPage';
// --- End MUI Imports ---
// ... other imports ...
// --- Add Icon, IconButton, and Tooltip Imports ---
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// Optional: If you want a specific icon for Login
// import LoginIcon from '@mui/icons-material/Login';
// --- End Icon Imports ---
// ... other MUI imports ...
import InputAdornment from '@mui/material/InputAdornment'; // To add icon inside TextField
import TextField from '@mui/material/TextField'; // For search input
import React, { useState } from 'react';
// ... other Icon imports ...
import SearchIcon from '@mui/icons-material/Search'; // Icon for search
// --- End MUI Imports ---

// ... other imports ...
// ... other MUI imports ...
// ... other Icon imports ...
// --- End MUI Imports ---

// ... other imports ...
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import './App.css';
// ... rest of the file up to Navigation component ...

// --- MUI Dark Theme (No changes needed here) ---
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#90caf9' },
        secondary: { main: '#f48fb1' },
        background: { default: '#121212', paper: '#1e1e1e' },
        text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
    },
});

// --- Navigation Component (AppBar background color usage updated) ---
// --- Updated Navigation using MUI Icons ---
// --- Updated Navigation with Search Input ---
function Navigation() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const navigate = useNavigate(); // Hook for navigation

    if (isLoading) {
        return null;
    }

    // Handle search submission
    const handleSearchSubmit = (event) => {
        // Check if Enter key was pressed
        if (event.key === 'Enter' && searchQuery.trim() !== '') {
            event.preventDefault(); // Prevent default form submission if inside a form
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`); // Navigate to search results page
            // Optionally clear search query after navigation
            // setSearchQuery('');
        }
    };


    return (
        <AppBar
           position="static"
           elevation={1}
           sx={{ marginBottom: 2, backgroundColor: grey[900] }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}> {/* Use space-between */}

                {/* === LOGO INTEGRATION START === */}
                {/* Left Side: App Logo */}
                <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        // Ensure 'my-logo.png' is the correct filename in /public/images/
                        src={process.env.PUBLIC_URL + '/images/my_logo.png'}
                        alt="CollegeConnect Logo"
                        style={{ height: '40px' }} // Adjust height as needed
                    />
                </Link>
                {/* === LOGO INTEGRATION END === */}


                {/* Center: Search Bar (only shown when logged in?) */}
                {isAuthenticated && (
                    <Box sx={{ width: '30%', minWidth: '200px' }}> {/* Adjust width as needed */}
                        <TextField
                            fullWidth
                            size="small" // Make it less tall
                            variant="outlined"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchSubmit} // Trigger search on Enter
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                                sx: { // Style the input itself
                                    borderRadius: '8px', // Rounded corners
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly lighter background
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                    '&.Mui-focused': { // When input is focused
                                         backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                }
                            }}
                            sx={{ // Style the overall TextField wrapper
                                '& .MuiInputBase-input': { // Style the actual text input
                                    color: '#fff', // Ensure text is white
                                },
                            }}
                        />
                    </Box>
                )}

                {/* Right Side: Navigation Icons/Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Home">
                       <IconButton component={RouterLink} to="/" color="inherit" aria-label="Home"> <HomeIcon /> </IconButton>
                    </Tooltip>
                    {isAuthenticated ? (
                        <>
                            <Tooltip title="Create Post">
                                <IconButton component={RouterLink} to="/create-post" color="inherit" aria-label="Create Post"> <AddCircleOutlineIcon /> </IconButton>
                            </Tooltip>
                            <Tooltip title="Profile">
                            <IconButton component={RouterLink} to="/profile" color="inherit" aria-label="Profile">
                                <Avatar
            // Use profile picture from the authenticated user context
                                src={user?.profilePictureUrl}
                                sx={{ width: 28, height: 28 }} // Adjust size as needed
                            >
            {/* Fallback to icon if no picture URL in context */}
                            <AccountCircleIcon />
                            </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={`Logout (${user?.name?.split(' ')[0] || user?.email})`}>
                                <Button color="inherit" onClick={logout} sx={{ ml: 1 }}> Logout </Button>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip title="Login">
                            <Button component={RouterLink} to="/login" color="inherit"> Login </Button>
                        </Tooltip>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
// ... rest of App component ...

// --- Main App Component (No changes needed here) ---
function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Navigation />
                    <Container component="main" maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
                    <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/auth/callback" element={<AuthCallbackPage />} />
                            <Route path="/create-post" element={<CreatePostPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            {/* Route for viewing other users' profiles by ID */}
                            <Route path="/profile/:userId" element={<ProfilePage />} />
                            {/* --- Add Search Route --- */}
                            <Route path="/search" element={<SearchPage />} />
                            {/* Add more routes here */}
                            <Route path="/tags/:tagName" element={<TagResultsPage />} />
                        </Routes>
                    </Container>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;