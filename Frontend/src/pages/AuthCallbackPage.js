import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context
  const [processing, setProcessing] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const error = queryParams.get('error');

    if (token) {
      console.log("Received token:", token);
      // Call the login function from AuthContext
      // This will store the token, fetch user data, and update the state
      login(token);

      // Redirect to home page after context updates (or maybe handle loading state in context)
      // For simplicity now, we just navigate immediately. Context will handle user fetching.
      navigate('/');

    } else if (error) {
      console.error("OAuth Error:", error);
      setErrorMsg(`Authentication failed: ${error}. Please try again.`);
      setProcessing(false);
       // Optionally redirect back to login after a delay
       // setTimeout(() => navigate('/login?error=' + error), 3000);
    } else {
       console.error("No token or error found in callback URL.");
       setErrorMsg("Authentication callback failed. No token received.");
       setProcessing(false);
        // Optionally redirect back to login after a delay
        // setTimeout(() => navigate('/login?error=CallbackFailed'), 3000);
    }
    // We only want this effect to run once on mount based on location.search changing
    // Login function itself should be stable (wrapped in useCallback in context if needed)
  }, [location.search, login, navigate]); // Add login and navigate to dependency array


  if (errorMsg) {
       return (
            <div>
                <h1>Authentication Error</h1>
                <p style={{ color: 'red' }}>{errorMsg}</p>
                <button onClick={() => navigate('/login')}>Go to Login</button>
            </div>
       );
  }

   if (processing) {
        return (
            <div>
                <h1>Loading...</h1>
                <p>Processing authentication callback...</p>
            </div>
        );
    }

    // Should ideally not reach here if successful redirect happens
    return <div>Processing complete. Redirecting...</div>

}

export default AuthCallbackPage;