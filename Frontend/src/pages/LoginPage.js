import React from 'react';
// --- MUI Imports ---
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google'; // Import Google icon
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// --- End MUI Imports ---

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    // Use MUI components for layout and styling
    <Container component="main" maxWidth="xs"> {/* xs = extra small width */}
       <Box
         sx={{
           marginTop: 8, // Add top margin
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center',
         }}
       >
          <Typography component="h1" variant="h5">
             Sign In
          </Typography>
          <Typography component="p" sx={{ mt: 1, mb: 3 }}> {/* Add margin top/bottom */}
             Sign in using your Google account to continue.
          </Typography>

          {/* --- Replace HTML button with MUI Button --- */}
          <Button
              variant="contained" // Gives it background color and elevation
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />} // Add Google icon before text
              fullWidth // Make button take full width of container
          >
             Sign in with Google
          </Button>
          {/* --- End Replacement --- */}
       </Box>
    </Container>
  );
}

export default LoginPage;