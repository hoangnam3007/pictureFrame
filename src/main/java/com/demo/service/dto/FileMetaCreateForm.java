package com.demo.service.dto;

public class FileMetaCreateForm {

    private String fileName;
    private String contentType;
    private byte[] contentBytes;

    // Builder Pattern for constructing FileMetaCreateForm
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private String fileName;
        private String contentType;
        private byte[] contentBytes;

        public Builder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public Builder contentType(String contentType) {
            this.contentType = contentType;
            return this;
        }

        public Builder contentBytes(byte[] contentBytes) {
            this.contentBytes = contentBytes;
            return this;
        }

        public FileMetaCreateForm build() {
            return new FileMetaCreateForm(fileName, contentType, contentBytes);
        }
    }

    // Constructor and Getters
    private FileMetaCreateForm(String fileName, String contentType, byte[] contentBytes) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.contentBytes = contentBytes;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getContentBytes() {
        return contentBytes;
    }
}
