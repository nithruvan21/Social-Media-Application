import React, { useRef, useState } from 'react'; // Import useRef
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// --- MUI Imports ---
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// --- MUI Icons ---
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'; // Icon for image upload
import SendIcon from '@mui/icons-material/Send'; // Icon for submit button
// --- End MUI Imports ---


function CreatePostForm() {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // For preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null); // Ref to access file input

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      // Create blob URL for preview
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Trigger hidden file input click
   const handleUploadButtonClick = () => {
       fileInputRef.current?.click();
   };

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
        });
        finalImageUrl = uploadResponse.data.imageUrl;
        console.log("Image uploaded, URL:", finalImageUrl);
         // Revoke object URL after upload to free memory
         URL.revokeObjectURL(imagePreviewUrl);
         setImagePreviewUrl(''); // Clear preview after successful upload
      }

      // 2. Create post data
      const postData = {
        content: content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        imageUrl: finalImageUrl,
      };
      console.log("Submitting post data:", postData);
      await api.post('/posts', postData);
      console.log("Post created successfully!");
      navigate('/'); // Navigate home

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
      setIsSubmitting(false);
    }
    // Keep submitting state true on success because we navigate away
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
                    variant="outlined" // Standard MUI style
                />

                {/* Tags Field */}
                <TextField
                    margin="normal" fullWidth
                    id="tags" label="Tags (comma-separated, optional)" name="tags"
                    value={tags} onChange={(e) => setTags(e.target.value)}
                    disabled={isSubmitting}
                    variant="outlined"
                    helperText="Separate tags with commas, e.g., event, notice, fun"
                />

                {/* Image Upload Section */}
                <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                     {/* Hidden actual file input */}
                     <input
                        ref={fileInputRef}
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }} // Hide the default input
                        disabled={isSubmitting}
                     />
                     {/* Button to trigger file input */}
                     <Button
                        variant="outlined"
                        onClick={handleUploadButtonClick}
                        startIcon={<AddPhotoAlternateIcon />}
                        disabled={isSubmitting}
                     >
                        {imageFile ? "Change Image" : "Add Image"}
                     </Button>
                     {/* Display file name or preview */}
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
                 variant="contained" // Prominent submit button
                 disabled={isSubmitting || !content.trim()} // Disable if no content or submitting
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