package com.demo.web.rest;

import com.demo.service.dto.ResponseImageDTO;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api")
public class BackgroundRemovalController {

    private static final Logger logger = LoggerFactory.getLogger(BackgroundRemovalController.class);

    private final String tempDirPath = "D:/Assignment/jhipster/PictureFrame/src/main/webapp/content/images/temp";

    // WebClient configuration for async processing
    private final WebClient webClient = WebClient.builder()
        .baseUrl("http://localhost:5001")
        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer
        .build();

    @PostMapping("/upload-image")
    public Mono<ResponseEntity<ResponseImageDTO>> uploadImage(@RequestPart("file") FilePart filePart) {
        Path tempDir = Paths.get(tempDirPath);
        if (!Files.exists(tempDir)) {
            new File(tempDirPath).mkdirs();
        }

        String originalFileName = filePart.filename();
        Path originalFilePath = tempDir.resolve(originalFileName);

        long currentTime = System.currentTimeMillis();
        long maxAgeInSeconds = 60 * 60; // 60 minute (60 seconds)
        long expirationTime = currentTime + (maxAgeInSeconds * 1000); // 60 minute in milliseconds

        return filePart
            .transferTo(originalFilePath)
            .then(callFlaskBackgroundRemovalAPI(originalFilePath))
            .flatMap(backgroundRemovedPath -> {
                // Create .meta file with 1 minute expiration
                createMetaFile(originalFilePath.getFileName().toString(), currentTime, expirationTime);

                // Use the relative path to the image
                String publicOriginalImageUrl = "/content/images/temp/" + originalFileName;
                String publicRemovedImageUrl = "/content/images/temp/removed-" + originalFileName;

                // Create cookies for the images
                ResponseCookie originalImageCookie = ResponseCookie.from("originalImagePath", publicOriginalImageUrl)
                    .maxAge(maxAgeInSeconds) // Cookie expires in 1 minute
                    .path("/")
                    .build();

                ResponseCookie removedImageCookie = ResponseCookie.from("removedImagePath", publicRemovedImageUrl)
                    .maxAge(maxAgeInSeconds) // Cookie expires in 1 minute
                    .path("/")
                    .build();

                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.SET_COOKIE, originalImageCookie.toString());
                headers.add(HttpHeaders.SET_COOKIE, removedImageCookie.toString());

                logger.info("Received file: {}", originalImageCookie);
                logger.info("Removed file: {}", removedImageCookie);

                // Build response DTO
                ResponseImageDTO responseDTO = new ResponseImageDTO(
                    "some-id",
                    publicOriginalImageUrl,
                    publicRemovedImageUrl,
                    filePart.headers().getContentLength()
                );

                return Mono.just(ResponseEntity.ok().headers(headers).body(responseDTO));
            });
    }

    // Create the .meta file to store file expiration time
    private void createMetaFile(String originalFileName, long createdAt, long expiresAt) {
        Path metadataFile = Paths.get(tempDirPath, originalFileName + ".meta");
        try (FileWriter writer = new FileWriter(metadataFile.toFile())) {
            Properties metadata = new Properties();
            metadata.setProperty("createdAt", String.valueOf(createdAt));
            metadata.setProperty("expiresAt", String.valueOf(expiresAt)); // 1 minute expiration
            metadata.store(writer, "File Expiration Metadata");
            logger.info("Meta file created for: {}", originalFileName);
        } catch (IOException e) {
            logger.error("Error creating meta file for: {}", originalFileName, e);
        }
    }

    // Method to call Flask API for background removal
    private Mono<String> callFlaskBackgroundRemovalAPI(Path originalFilePath) {
        return Mono.fromCallable(() -> Files.readAllBytes(originalFilePath))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(fileBytes -> {
                LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add(
                    "image",
                    new ByteArrayResource(fileBytes) {
                        @Override
                        public String getFilename() {
                            return originalFilePath.getFileName().toString();
                        }
                    }
                );

                // Asynchronously send file to Flask for background removal
                return webClient
                    .post()
                    .uri("/remove-background")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(byte[].class);
            })
            .flatMap(responseBytes -> {
                Path removedFilePath = Paths.get(tempDirPath + "/removed-" + originalFilePath.getFileName());
                return Mono.fromCallable(() -> {
                    Files.write(removedFilePath, responseBytes);
                    return removedFilePath.toString(); // Return the removed image path
                }).subscribeOn(Schedulers.boundedElastic());
            });
    }

    @DeleteMapping("/remove-image")
    public Mono<ResponseEntity<Void>> removeImage(
        @CookieValue(value = "originalImagePath", defaultValue = "") String originalImagePath,
        @CookieValue(value = "removedImagePath", defaultValue = "") String removedImagePath
    ) {
        logger.info("Attempting to delete images with paths - Original: {}, Removed: {}", originalImagePath, removedImagePath);

        return Mono.fromRunnable(() -> {
            // Base directory for image storage
            String baseDirectory = "D:/Assignment/jhipster/PictureFrame/src/main/webapp/";

            // Decode the URL-encoded paths from the cookies
            String decodedOriginalImagePath = URLDecoder.decode(originalImagePath, StandardCharsets.UTF_8);
            String decodedRemovedImagePath = URLDecoder.decode(removedImagePath, StandardCharsets.UTF_8);

            // Combine the base directory with the decoded paths to get the full file paths
            String adjustedOriginalImagePath = baseDirectory + decodedOriginalImagePath;
            String adjustedRemovedImagePath = baseDirectory + decodedRemovedImagePath;

            // Delete original image
            if (!originalImagePath.isEmpty()) {
                File originalFile = new File(adjustedOriginalImagePath);
                if (originalFile.exists()) {
                    boolean deleted = originalFile.delete();
                    logger.info("Deleted original image: {}, Status: {}", adjustedOriginalImagePath, deleted ? "Success" : "Failed");
                } else {
                    logger.warn("Original image not found: {}", adjustedOriginalImagePath);
                }
            }

            // Delete background-removed image
            if (!removedImagePath.isEmpty()) {
                File removedFile = new File(adjustedRemovedImagePath);
                if (removedFile.exists()) {
                    boolean deleted = removedFile.delete();
                    logger.info(
                        "Deleted background removed image: {}, Status: {}",
                        adjustedRemovedImagePath,
                        deleted ? "Success" : "Failed"
                    );
                } else {
                    logger.warn("Background removed image not found: {}", adjustedRemovedImagePath);
                }
            }
        }).then(Mono.just(ResponseEntity.noContent().build()));
    }
}
