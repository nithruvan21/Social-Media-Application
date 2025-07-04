package com.project.social_media_application.service;

import java.util.Arrays; // For splitting the tags
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors; // For stream operations

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode; // For proper JSON parsing
import com.fasterxml.jackson.databind.ObjectMapper; // For proper JSON parsing

import reactor.core.publisher.Mono;


@Service
public class AiTaggingService {

    private final WebClient webClient;
    private final String apiKey;
    private final ObjectMapper objectMapper; // For parsing JSON responses

    // Inject configuration properties and WebClient.Builder
    public AiTaggingService(WebClient.Builder webClientBuilder,
                            @Value("${ai.provider.api.key}") String apiKey,
                            @Value("${ai.provider.api.endpoint}") String apiEndpoint,
                            ObjectMapper objectMapper) { // Inject ObjectMapper
        // We build the WebClient here but use the full endpoint URL in the request
        this.webClient = webClientBuilder
                            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                            .build();
        this.apiKey = apiKey;
        this.objectMapper = objectMapper; // Assign injected mapper
    }

    public Mono<List<String>> suggestTags(String postContent) {
        if (postContent == null || postContent.trim().isEmpty()) {
            return Mono.just(Collections.emptyList());
        }

        // 1. Construct the Prompt
        String prompt = "Suggest maximum 5 relevant, single-word, lowercase tags for the following college social media post content, related to topics like events, studies, campus life, clubs, or student activities. Separate tags with commas only. If no relevant tags are found, output 'none'.\n\nContent: \"" + postContent + "\"\n\nTags:";

        // 2. Construct the Request Body for Gemini API
        // Reference: https://ai.google.dev/docs/api/rest/v1beta/models/generateContent
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            // Optional: Add generation config if needed
            "generationConfig", Map.of(
                "maxOutputTokens", 50, // Limit output size
                "temperature", 0.4,    // Lower temperature for more predictable tags
                "topP", 0.9,           // Nucleus sampling
                "topK", 1             // Use top-k sampling
                // "stopSequences", List.of("\n") // Optional: Stop generation at newline
            )
            // Optional: Add safety settings if needed
            // "safetySettings", List.of(...)
        );
        

        // 3. Get the full API endpoint URL from properties
        String fullApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"; // Assuming apiEndpoint from properties is the full URL
        try {
            String jsonRequestBody = objectMapper.writeValueAsString(requestBody);
            System.out.println("Sending JSON Request Body to Gemini: " + jsonRequestBody);
        } catch (Exception e) {
            System.err.println("Error converting requestBody to JSON for logging: " + e.getMessage());
        }
        // 4. Make the API Call using WebClient
        return webClient.post()
                .uri(fullApiUrl + "?key={apiKey}", apiKey) // Pass API key as URI variable
                .bodyValue(requestBody)
                .retrieve() // Start retrieving the response
                .bodyToMono(String.class) // Get the raw JSON response as a String
                .map(this::parseGeminiResponse) // Parse the JSON response string
                .onErrorResume(error -> { // Handle errors gracefully
                    System.err.println("Error calling AI API: " + error.getMessage());
                     // You could log the error in more detail here
                    return Mono.just(Collections.emptyList()); // Return empty list on error
                });
    }

    // 5. Parse the Gemini API Response
    private List<String> parseGeminiResponse(String responseBody) {
         // Reference: https://ai.google.dev/docs/api/rest/v1beta/models/generateContent#response-body
        try {
            System.out.println("Raw Gemini Response: " + responseBody); // Log for debugging
            JsonNode root = objectMapper.readTree(responseBody);

            // Navigate through the JSON structure to get the generated text
            // This path might change based on API updates, always verify with docs
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String tagsText = parts.get(0).path("text").asText();

                     System.out.println("Extracted Tags Text: " + tagsText); // Log extracted text

                    // Process the extracted text
                    if (tagsText != null && !tagsText.trim().isEmpty() && !tagsText.trim().equalsIgnoreCase("none")) {
                        // Split by comma, trim whitespace, filter empty strings, ensure lowercase
                        return Arrays.stream(tagsText.split(","))
                                     .map(String::trim)
                                     .filter(tag -> !tag.isEmpty())
                                     .map(String::toLowerCase)
                                     // Optional: Add more filtering (e.g., remove special chars)
                                     .collect(Collectors.toList());
                    }
                }
            }
            // Handle cases where the expected structure isn't found or no text is generated
             System.out.println("Could not find valid tags text in Gemini response structure.");

        } catch (Exception e) {
            System.err.println("Error parsing Gemini API response JSON: " + e.getMessage());
            // Log the exception stack trace for detailed debugging if needed
            // e.printStackTrace();
        }
        return Collections.emptyList(); // Return empty list if parsing fails or no tags found
    }
}