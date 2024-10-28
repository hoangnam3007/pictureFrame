package com.demo.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.demo.domain.Advertisement} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AdvertisementDTO implements Serializable {

    private Long id;

    @NotNull(message = "must not be null")
    private String brand;

    @NotNull(message = "must not be null")
    private String imagePath;

    @NotNull(message = "must not be null")
    private String redirectUrl;

    @NotNull(message = "must not be null")
    private Boolean active;

    private Instant createdAt;

    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AdvertisementDTO)) {
            return false;
        }

        AdvertisementDTO advertisementDTO = (AdvertisementDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, advertisementDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AdvertisementDTO{" +
            "id=" + getId() +
            ", brand='" + getBrand() + "'" +
            ", imagePath='" + getImagePath() + "'" +
            ", redirectUrl='" + getRedirectUrl() + "'" +
            ", active='" + getActive() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            "}";
    }
}
