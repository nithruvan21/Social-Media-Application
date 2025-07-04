package com.project.social_media_application.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "dykqs47ek",
            "api_key", "768131854988894",
            "api_secret", "re3Cex57QR4jPCvLP6s3Pl0Qww8",
            "secure", true
        ));
    }
}
