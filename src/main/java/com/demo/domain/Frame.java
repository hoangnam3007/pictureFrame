package com.demo.domain;

import com.demo.domain.enumeration.FrameType;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * A Frame.
 */
@Table("frame")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Frame implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column("id")
    private Long id;

    @NotNull(message = "must not be null")
    @Column("title")
    private String title;

    @NotNull(message = "must not be null")
    @Column("type")
    private FrameType type;

    @Column("description")
    private String description;

    @Column("guideline_url")
    private String guidelineUrl;

    @NotNull(message = "must not be null")
    @Column("image_path")
    private String imagePath;

    @Column("usage_count")
    private Integer usageCount;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    @Transient
    private User creator;

    @Column("creator_id")
    private Long creatorId;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Frame id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Frame title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FrameType getType() {
        return this.type;
    }

    public Frame type(FrameType type) {
        this.setType(type);
        return this;
    }

    public void setType(FrameType type) {
        this.type = type;
    }

    public String getDescription() {
        return this.description;
    }

    public Frame description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGuidelineUrl() {
        return this.guidelineUrl;
    }

    public Frame guidelineUrl(String guidelineUrl) {
        this.setGuidelineUrl(guidelineUrl);
        return this;
    }

    public void setGuidelineUrl(String guidelineUrl) {
        this.guidelineUrl = guidelineUrl;
    }

    public String getImagePath() {
        return this.imagePath;
    }

    public Frame imagePath(String imagePath) {
        this.setImagePath(imagePath);
        return this;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Integer getUsageCount() {
        return this.usageCount;
    }

    public Frame usageCount(Integer usageCount) {
        this.setUsageCount(usageCount);
        return this;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Frame createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return this.updatedAt;
    }

    public Frame updatedAt(Instant updatedAt) {
        this.setUpdatedAt(updatedAt);
        return this;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getCreator() {
        return this.creator;
    }

    public void setCreator(User user) {
        this.creator = user;
        this.creatorId = user != null ? user.getId() : null;
    }

    public Frame creator(User user) {
        this.setCreator(user);
        return this;
    }

    public Long getCreatorId() {
        return this.creatorId;
    }

    public void setCreatorId(Long user) {
        this.creatorId = user;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Frame)) {
            return false;
        }
        return getId() != null && getId().equals(((Frame) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Frame{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", type='" + getType() + "'" +
            ", description='" + getDescription() + "'" +
            ", guidelineUrl='" + getGuidelineUrl() + "'" +
            ", imagePath='" + getImagePath() + "'" +
            ", usageCount=" + getUsageCount() +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            "}";
    }
}
