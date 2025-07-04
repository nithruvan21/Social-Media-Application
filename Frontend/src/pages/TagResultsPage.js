// Gemini/Frontend/pages/TagResultsPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
// Reuse PostList - NO, render PostCard directly as per previous implementation
// import PostList from '../components/PostList';

// --- FIX: Add this import line ---
import PostCard from '../components/PostCard';
// --- End FIX ---

// MUI Imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function TagResultsPage() {
    const { tagName: encodedTagName } = useParams();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const tagName = encodedTagName ? decodeURIComponent(encodedTagName) : '';

    useEffect(() => {
        if (!tagName) {
            setError("No tag specified.");
            setIsLoading(false);
            setPosts([]);
            return;
        }

        setIsLoading(true);
        setError('');
        setPosts([]);

        api.get(`/posts/tag/${encodeURIComponent(tagName)}`)
            .then(response => {
                if (Array.isArray(response.data)) {
                    setPosts(response.data);
                } else {
                    console.error("Invalid data received for tag search:", response.data);
                    setError("Received invalid data format from server.");
                }
            })
            .catch(err => {
                console.error(`Error fetching posts for tag "${tagName}":`, err);
                setError(`Failed to load posts for tag #${tagName}.`);
            })
            .finally(() => {
                setIsLoading(false);
            });

    }, [tagName]);

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" sx={{ my: 3, textAlign: 'center' }}>
                Posts tagged with #{tagName}
            </Typography>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            )}

            {!isLoading && !error && posts.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                    No posts found with the tag #{tagName}.
                </Typography>
            )}

            {!isLoading && !error && posts.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     {/* Now PostCard is defined and can be used */}
                     {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Box>
            )}
        </Container>
    );
}

export default TagResultsPage;