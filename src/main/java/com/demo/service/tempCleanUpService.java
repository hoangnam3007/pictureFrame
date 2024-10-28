package com.demo.service;

import com.demo.web.rest.BackgroundRemovalController;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class tempCleanUpService {

    private final String tempDirPath = "D:/Assignment/jhipster/PictureFrame/src/main/webapp/content/images/temp";
    private static final Logger logger = LoggerFactory.getLogger(tempCleanUpService.class);

    @Scheduled(fixedRate = 1800000) // Check every 10 seconds
    public void cleanupOldFiles() {
        File tempDir = new File(tempDirPath);
        if (tempDir.exists() && tempDir.isDirectory()) {
            File[] files = tempDir.listFiles((dir, name) -> name.endsWith(".meta"));
            if (files != null) {
                long currentTime = System.currentTimeMillis();
                logger.info("Running cleanup at {}", currentTime);

                for (File metaFile : files) {
                    try {
                        Properties metadata = new Properties();
                        try (FileReader reader = new FileReader(metaFile)) {
                            metadata.load(reader);
                        }

                        long expiresAt = Long.parseLong(metadata.getProperty("expiresAt"));
                        logger.info("Checking file: {}. Expires at: {}, Current time: {}", metaFile.getName(), expiresAt, currentTime);

                        // Check if the file is expired
                        if (currentTime > expiresAt) {
                            // Get the associated image file names
                            String originalFileName = metaFile.getName().replace(".meta", "");
                            String removedFileName = "removed-" + originalFileName;

                            // Delete the original image file
                            File originalFile = new File(tempDirPath, originalFileName);
                            if (originalFile.exists()) {
                                boolean originalDeleted = originalFile.delete();
                                logger.info(
                                    "Deleted expired original file: {}, Status: {}",
                                    originalFile.getName(),
                                    originalDeleted ? "Success" : "Failed"
                                );
                            } else {
                                logger.warn("Original image file not found: {}", originalFile.getName());
                            }

                            // Delete the background-removed image file
                            File removedFile = new File(tempDirPath, removedFileName);
                            if (removedFile.exists()) {
                                boolean removedDeleted = removedFile.delete();
                                logger.info(
                                    "Deleted expired background removed file: {}, Status: {}",
                                    removedFile.getName(),
                                    removedDeleted ? "Success" : "Failed"
                                );
                            } else {
                                logger.warn("Background removed image file not found: {}", removedFile.getName());
                            }

                            // Delete the .meta file as well
                            boolean metaDeleted = metaFile.delete();
                            logger.info("Deleted metadata file: {}, Status: {}", metaFile.getName(), metaDeleted ? "Success" : "Failed");
                        } else {
                            logger.info("File not expired yet: {}", metaFile.getName());
                        }
                    } catch (IOException | NumberFormatException e) {
                        logger.error("Error processing metadata file: {}", metaFile.getName(), e);
                    }
                }
            } else {
                logger.info("No .meta files found for cleanup.");
            }
        } else {
            logger.warn("Temporary directory does not exist or is not a directory: {}", tempDirPath);
        }
    }
}
