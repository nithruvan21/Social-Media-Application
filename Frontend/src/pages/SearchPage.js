import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook to get URL query params
import UserSearchResultItem from '../components/UserSearchResultItem'; // Import the item component
import api from '../services/api';

// MUI Imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

function SearchPage() {
    const [searchParams] = useSearchParams(); // Get URL search parameters
    const query = searchParams.get('query'); // Extract the 'query' parameter
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch results when the query parameter changes
        if (query && query.trim() !== '') {
            const fetchResults = async () => {
                setIsLoading(true);
                setError('');
                setResults([]); // Clear previous results
                try {
                    // GET /api/users/search?query=...
                    console.log(query)
                    const response = await api.get(`/user/search?query=${encodeURIComponent(query.trim())}`);
                    console.log(response)
                    if (Array.isArray(response.data)) {
                        setResults(response.data);
                    } else {
                         console.error("Invalid search data received:", response.data);
                         setError("Received invalid data format from server.");
                    }
                } catch (err) {
                    console.error("Error searching users:", err);
                    setError("Failed to fetch search results.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResults();
        } else {
            // Clear results if query is empty or missing
            setResults([]);
            setError(''); // Clear error if query is cleared
        }
    }, [query]); // Dependency array ensures refetch when query changes

    return (
        <Container component="main" maxWidth="md"> {/* Medium max width */}
            <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3 }}>
                Search Results for "{query || ''}"
            </Typography>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            )}

            {!isLoading && !error && results.length === 0 && query && (
                <Typography sx={{ mt: 2 }}>No users found matching your query.</Typography>
            )}

            {!isLoading && !error && results.length > 0 && (
                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}> {/* List with background */}
                    {results.map(user => (
                        <UserSearchResultItem key={user.id} user={user} />
                    ))}
                </List>
            )}
        </Container>
    );
}

export default SearchPage;