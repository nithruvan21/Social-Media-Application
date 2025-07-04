import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api'; // Import our configured axios instance

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user details (null if logged out)
  const [isLoading, setIsLoading] = useState(true); // Track initial loading state

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      // Validate token by fetching user profile
      api.get('/user/me') // Call backend endpoint to get user details
        .then(response => {
          setUser(response.data); // Set user state if token is valid
        })
        .catch(error => {
          console.error("Token validation failed:", error);
          localStorage.removeItem('jwtToken'); // Remove invalid token
        })
        .finally(() => {
          setIsLoading(false); // Loading finished
        });
    } else {
      setIsLoading(false); // No token, loading finished
    }
  }, []); // Run only once on mount

  // Login function: Stores token and fetches user data
  const login = (token) => {
    localStorage.setItem('jwtToken', token);
    setIsLoading(true); // Start loading user data
     api.get('/user/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch user after login:", error);
           // Handle error - maybe the token from callback was bad?
           localStorage.removeItem('jwtToken'); // Clear bad token
           setUser(null);
        })
        .finally(() => {
           setIsLoading(false);
        });
  };

  // Logout function: Clears token and user state
  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
     // Optional: Redirect to login page
     // navigate('/login'); // Would need useNavigate hook here or pass it in
     console.log("User logged out.");
  };

  // Value provided to consuming components
  const value = {
    user, // The authenticated user object (or null)
    isAuthenticated: !!user, // Boolean flag: true if user object exists
    isLoading, // Boolean flag: true during initial token validation/user fetch
    login, // Function to call after getting token
    logout // Function to call for logging out
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};