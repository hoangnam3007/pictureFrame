package com.demo.service.dto;

import com.demo.domain.enumeration.FrameType;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.demo.domain.Frame} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FrameDTO implements Serializable {

    private Long id;

    @NotNull(message = "must not be null")
    private String title;

    @NotNull(message = "must not be null")
    private FrameType type;

    @Lob
    private String description;

    private String guidelineUrl;

    @NotNull(message = "must not be null")
    private String imagePath;

    private Integer usageCount;

    private Instant createdAt;

    private Instant updatedAt;

    private UserDTO creator;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FrameType getType() {
        return type;
    }

    public void setType(FrameType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGuidelineUrl() {
        return guidelineUrl;
    }

    public void setGuidelineUrl(String guidelineUrl) {
        this.guidelineUrl = guidelineUrl;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UserDTO getCreator() {
        return creator;
    }

    public void setCreator(UserDTO creator) {
        this.creator = creator;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FrameDTO)) {
            return false;
        }

        FrameDTO frameDTO = (FrameDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, frameDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FrameDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", type='" + getType() + "'" +
            ", description='" + getDescription() + "'" +
            ", guidelineUrl='" + getGuidelineUrl() + "'" +
            ", imagePath='" + getImagePath() + "'" +
            ", usageCount=" + getUsageCount() +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            ", creator=" + getCreator() +
            "}";
    }
}
