package com.demo.web.rest;

import com.demo.service.dto.ImageDTO;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/create-frame")
public class CreateFrameResource {

    private static final Logger logger = LoggerFactory.getLogger(CreateFrameResource.class);
    private final String tempDirPath = "D:/Assignment/jhipster/PictureFrame/src/main/webapp/content/images/p";

    @PostMapping("/saveImage")
    public Mono<ResponseEntity<ImageDTO>> uploadImage(
        @RequestPart("file") FilePart filePart,
        @RequestParam(value = "url", required = true) String url
    ) {
        try {
            logger.info("Received request with URL: {}", url);
            // Ensure base directory exists
            Path tempDir = Paths.get(tempDirPath, url);
            if (!Files.exists(tempDir)) {
                Files.createDirectories(tempDir);
            }

            // Generate a unique filename to prevent overwriting
            String originalFileName = filePart.filename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName;
            Path filePath = tempDir.resolve(uniqueFileName);

            // Transfer the file to the target directory
            return filePart
                .transferTo(filePath)
                .then(
                    Mono.fromCallable(() -> {
                        // Generate the public URL for the file
                        String publicOriginalImageUrl = "/content/images/p/" + url + "/" + uniqueFileName;
                        logger.info("File uploaded successfully: {}", publicOriginalImageUrl);

                        // Return the ImageDTO
                        ImageDTO imageDto = new ImageDTO(1, publicOriginalImageUrl);
                        return ResponseEntity.ok().body(imageDto);
                    })
                )
                .onErrorResume(e -> {
                    logger.error("Failed to upload file: {}", e.getMessage());
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
        } catch (Exception e) {
            logger.error("Error handling file upload: {}", e.getMessage());
            return Mono.just(ResponseEntity.internalServerError().build());
        }
    }

    @PostMapping("/updateImage")
    public Mono<ResponseEntity<ImageDTO>> updateImage(
        @RequestPart("file") FilePart filePart,
        @RequestParam(value = "url", required = true) String url,
        @RequestParam(value = "existingFileName", required = true) String existingFileName
    ) {
        try {
            logger.info("Received request to update image at URL: {}", url);

            logger.info("Received request to update image at URL: {}", url);
            logger.info("Existing file path: {}", existingFileName);

            // Ensure base directory exists
            Path targetDir = Paths.get(tempDirPath, url);
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            // Extract the file name from the full path (if provided)
            String fileName = Paths.get(existingFileName).getFileName().toString();
            Path existingFilePath = targetDir.resolve(fileName);

            // Delete the existing file
            if (Files.exists(existingFilePath)) {
                Files.delete(existingFilePath);
                logger.info("Deleted existing file: {}", existingFilePath);
            } else {
                logger.warn("Existing file not found: {}", existingFilePath);
            }

            // Generate a unique filename for the new file
            String originalFileName = filePart.filename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName;
            Path newFilePath = targetDir.resolve(uniqueFileName);

            // Transfer the new file to the target directory
            return filePart
                .transferTo(newFilePath)
                .then(
                    Mono.fromCallable(() -> {
                        // Generate the public URL for the new file
                        String publicOriginalImageUrl = "/content/images/p/" + url + "/" + uniqueFileName;
                        logger.info("File updated successfully: {}", publicOriginalImageUrl);

                        // Return the ImageDTO with the new URL
                        ImageDTO imageDto = new ImageDTO(1, publicOriginalImageUrl);
                        return ResponseEntity.ok().body(imageDto);
                    })
                )
                .onErrorResume(e -> {
                    logger.error("Failed to update file: {}", e.getMessage());
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
        } catch (Exception e) {
            logger.error("Error handling image update: {}", e.getMessage());
            return Mono.just(ResponseEntity.internalServerError().build());
        }
    }

    @DeleteMapping("/deleteUrl")
    public Mono<ResponseEntity<Void>> deleteUrl(@RequestParam(value = "url", required = true) String url) {
        try {
            logger.info("Received request to delete file or directory at URL: {}", url);

            // Construct the full path to the file or directory
            Path filePath = Paths.get(tempDirPath, url);
            logger.info("Attempting to delete file or directory at path: {}", filePath.toString());

            if (Files.exists(filePath)) {
                if (Files.isDirectory(filePath)) {
                    try (var paths = Files.walk(filePath)) {
                        paths
                            .sorted(Comparator.reverseOrder())
                            .forEach(path -> {
                                try {
                                    Files.delete(path);
                                    logger.info("Deleted file: {}", path);
                                } catch (IOException e) {
                                    logger.error("Error deleting file: {}", path, e);
                                }
                            });
                    }
                    logger.info("Directory deleted successfully: {}", filePath);
                } else {
                    // If it's a file, delete it directly
                    Files.delete(filePath);
                    logger.info("File deleted successfully: {}", filePath);
                }

                // Return a successful response
                return Mono.just(ResponseEntity.ok().build());
            } else {
                // If the file doesn't exist, return a 404 not found response
                logger.warn("File or directory not found: {}", filePath);
                return Mono.just(ResponseEntity.notFound().build());
            }
        } catch (Exception e) {
            // Handle any other errors during the deletion process
            logger.error("Error deleting file or directory: {}", e.getMessage(), e);
            return Mono.just(ResponseEntity.internalServerError().build());
        }
    }
}
