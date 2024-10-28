package com.demo.service.dto;

public class FileMetaInfo {

    private String fileName;
    private String contentType;
    private byte[] contentBytes;

    // Constructor
    public FileMetaInfo(String fileName, String contentType, byte[] contentBytes) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.contentBytes = contentBytes;
    }

    // Getters and Setters
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public byte[] getContentBytes() {
        return contentBytes;
    }

    public void setContentBytes(byte[] contentBytes) {
        this.contentBytes = contentBytes;
    }
}
