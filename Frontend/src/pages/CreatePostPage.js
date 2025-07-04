// Gemini/Frontend/src/components/CreatePostForm.js
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; //
import api from '../services/api'; //

// --- MUI Imports ---
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip'; // Import Chip for suggestions
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack'; // Import Stack for layout
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// --- MUI Icons ---
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Icon for suggest button
import SendIcon from '@mui/icons-material/Send';
// --- End MUI Imports ---


function CreatePostForm() {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(''); // Keep as comma-separated string for input
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); //
  const fileInputRef = useRef(null);

  // --- State for AI Suggestions ---
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  // --- End AI State ---

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadButtonClick = () => {
      fileInputRef.current?.click();
  };

  // --- Function to handle fetching tag suggestions ---
  const fetchTagSuggestions = async () => {
    if (!content.trim()) {
        setSuggestionError('Please enter some content first.');
        return;
    }
    if (!isAuthenticated) {
        setSuggestionError('Login required to get tag suggestions.');
        return;
    }
    setLoadingSuggestions(true);
    setSuggestionError('');
    setSuggestedTags([]); // Clear previous suggestions

    try {
        console.log("Requesting tag suggestions for content:", content);
        // Call the backend endpoint we created
        const response = await api.post('/posts/suggest-tags', { content: content.trim() }); // Send trimmed content
        console.log("Suggestions received:", response.data);

        if (response.data && Array.isArray(response.data.suggestedTags)) {
             // Filter out tags already present in the input field to avoid redundancy
            const currentTagsSet = new Set(tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean));
            const newSuggestions = response.data.suggestedTags.filter(
                tag => !currentTagsSet.has(tag.toLowerCase())
            );
            setSuggestedTags(newSuggestions);
            if (newSuggestions.length === 0 && response.data.suggestedTags.length > 0) {
                setSuggestionError('Suggestions already included in your tags.');
            } else if (response.data.suggestedTags.length === 0) {
                setSuggestionError('No specific tag suggestions found.');
            }
        } else {
            setSuggestedTags([]);
            setSuggestionError('Received unexpected data from suggestions endpoint.');
        }
    } catch (err) {
        console.error("Error fetching tag suggestions:", err);
        let errMsg = 'Could not fetch suggestions.';
        if (err.response?.status === 401) {
            errMsg = 'Authentication error. Please re-login.';
        } else if (err.response?.status === 500) {
            errMsg = 'Server error while generating suggestions.';
        }
        setSuggestionError(errMsg);
        setSuggestedTags([]);
    } finally {
        setLoadingSuggestions(false);
    }
  };
  // --- End fetch suggestions ---

  // --- Function to add a suggested tag to the input ---
  const handleAddSuggestedTag = (tagToAdd) => {
    setTags(prevTags => {
        // Split, trim, filter empty, add new tag if not present, join back
        const tagList = prevTags.split(',').map(t => t.trim()).filter(Boolean);
        const lowerCaseTagToAdd = tagToAdd.toLowerCase();
        // Check if tag (case-insensitive) is already present
        if (!tagList.some(tag => tag.toLowerCase() === lowerCaseTagToAdd)) {
             tagList.push(tagToAdd); // Add the tag with its original casing if desired
        }
        return tagList.join(', '); // Add space for readability
    });
     // Remove the tag from suggestions list after adding it
     setSuggestedTags(prev => prev.filter(t => t.toLowerCase() !== tagToAdd.toLowerCase()));
  };
  // --- End add suggested tag ---


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to create a post.");
        return;
    }
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    let finalImageUrl = '';

    try {
      // 1. Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        console.log("Uploading image...");
        const uploadResponse = await api.post('/posts/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }); //
        finalImageUrl = uploadResponse.data.imageUrl;
        console.log("Image uploaded, URL:", finalImageUrl);
         URL.revokeObjectURL(imagePreviewUrl);
         setImagePreviewUrl('');
      }

      // 2. Create post data
      const postData = {
        content: content.trim(), // Send trimmed content
        // Ensure tags are trimmed and empty ones are filtered out
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        imageUrl: finalImageUrl,
      };
      console.log("Submitting post data:", postData);
      await api.post('/posts', postData); //
      console.log("Post created successfully!");
      navigate('/'); // Navigate home after successful post

    } catch (err) {
      console.error("Error creating post:", err);
      let errorMsg = "Failed to create post.";
      if (err.response) {
         errorMsg = `Error: ${err.response.status}. ${err.response.data?.error || err.response.data?.message || 'Server error'}`;
      } else if (err.request) {
         errorMsg = "Error: No response from server.";
      } else {
         errorMsg = `Error: ${err.message}`;
      }
      setError(errorMsg);
      setIsSubmitting(false); // Keep form active on error
    }
    // Don't set isSubmitting to false on success because we navigate away
  };

  return (
    <Card sx={{ minWidth: 275, mt: 3 }}>
       <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                    Create New Post
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Content Field */}
                <TextField
                    margin="normal" required fullWidth multiline rows={4}
                    id="content" label="What's on your mind?" name="content"
                    value={content} onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                    variant="outlined"
                />

                {/* Tags Field & Suggest Button */}
                 <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                    <TextField
                        margin="none" // Remove default margin to align better
                        fullWidth
                        id="tags" label="Tags (comma-separated)" name="tags"
                        value={tags} onChange={(e) => setTags(e.target.value)}
                        disabled={isSubmitting}
                        variant="outlined"
                        helperText="Add relevant tags or use suggestions."
                        sx={{ flexGrow: 1 }} // Allow TextField to grow
                    />
                    <Button
                        variant="outlined"
                        size="large" // Match TextField height better ("medium" was slightly small)
                        onClick={fetchTagSuggestions}
                        disabled={loadingSuggestions || isSubmitting || !content.trim() || !isAuthenticated}
                        startIcon={loadingSuggestions ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                        sx={{ height: '56px' }} // Explicit height to match TextField
                    >
                        Suggest
                    </Button>
                 </Box>

                {/* Display Suggestion Loading/Error/Results */}
                {suggestionError && !loadingSuggestions && <Alert severity="warning" sx={{ mt: 1, fontSize: '0.9em' }}>{suggestionError}</Alert>}
                {suggestedTags.length > 0 && !loadingSuggestions && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block" gutterBottom>
                             Suggested Tags (click to add):
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                             {suggestedTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onClick={() => handleAddSuggestedTag(tag)}
                                    size="small"
                                    variant="outlined"
                                    color="primary" // Use primary color for suggestions
                                    clickable // Improves accessibility / indicates action
                                    disabled={isSubmitting} // Disable chips while main form is submitting
                                />
                             ))}
                        </Stack>
                    </Box>
                )}

                {/* Image Upload Section */}
                <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                     <input
                        ref={fileInputRef}
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        disabled={isSubmitting}
                     />
                     <Button
                        variant="outlined"
                        onClick={handleUploadButtonClick}
                        startIcon={<AddPhotoAlternateIcon />}
                        disabled={isSubmitting}
                     >
                        {imageFile ? "Change Image" : "Add Image"}
                     </Button>
                     {imageFile && !isSubmitting && (
                        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {imageFile.name}
                        </Typography>
                     )}
                 </Box>

                {/* Image Preview */}
                 {imagePreviewUrl && !isSubmitting && (
                     <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
                        <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px' }}
                        />
                    </Box>
                 )}


          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
             <Button
                 type="submit"
                 variant="contained"
                 disabled={isSubmitting || !content.trim()}
                 startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
             >
                 {isSubmitting ? 'Posting...' : 'Post'}
             </Button>
          </CardActions>
       </Box>
    </Card>
  );
}

export default CreatePostForm;