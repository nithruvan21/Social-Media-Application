package com.project.social_media_application.service;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ImageUploadService {

    // Add a Logger for better debugging
    private static final Logger logger = LoggerFactory.getLogger(ImageUploadService.class);

    private final Cloudinary cloudinary;

    // Constructor injection is good practice
    public ImageUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File to upload cannot be null or empty");
        }

        try {
            // Upload the file's bytes to Cloudinary
            // ObjectUtils.emptyMap() means we're not passing any specific upload options here
            // (like transformations, specific folder, etc.), but you could add them.
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

            logger.info("Cloudinary upload successful. Result map: {}", uploadResult);

            // --- This is the fix ---
            // Get the URL from the result map. Cloudinary typically returns it under the "url" key.
            // It might also return "secure_url" for HTTPS, which is generally preferred.
            Object urlObject = uploadResult.get("secure_url"); // Prioritize secure_url
            if (urlObject == null) {
                urlObject = uploadResult.get("url"); // Fallback to url
            }

            if (urlObject instanceof String) {
                String imageUrl = (String) urlObject;
                logger.info("Image uploaded successfully to URL: {}", imageUrl);
                return imageUrl;
            } else {
                // Log the unexpected result structure
                logger.error("Cloudinary upload result did not contain a String URL. Result: {}", uploadResult);
                throw new RuntimeException("Cloudinary upload failed: Could not retrieve URL from response.");
            }
        } catch (IOException e) {
            logger.error("IOException during Cloudinary upload", e);
            throw e; // Re-throw original IO exception
        } catch (Exception e) {
            // Catch other potential exceptions from Cloudinary SDK or processing
            logger.error("Error during Cloudinary upload", e);
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }
}