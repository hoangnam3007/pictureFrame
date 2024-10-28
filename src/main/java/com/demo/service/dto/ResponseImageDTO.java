package com.demo.service.dto;

public class ResponseImageDTO {

    private String id;
    private String originalImageUrl; // Path for the original image
    private String removedImageUrl; // Path for the image with the background removed
    private long size;

    public ResponseImageDTO(String id, String originalImageUrl, String removedImageUrl, long size) {
        this.id = id;
        this.originalImageUrl = originalImageUrl;
        this.removedImageUrl = removedImageUrl;
        this.size = size;
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOriginalImageUrl() {
        return originalImageUrl;
    }

    public void setOriginalImageUrl(String originalImageUrl) {
        this.originalImageUrl = originalImageUrl;
    }

    public String getRemovedImageUrl() {
        return removedImageUrl;
    }

    public void setRemovedImageUrl(String removedImageUrl) {
        this.removedImageUrl = removedImageUrl;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
