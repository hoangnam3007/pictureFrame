package com.demo.web.rest;

import com.demo.service.dto.ImageDTO;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
}
