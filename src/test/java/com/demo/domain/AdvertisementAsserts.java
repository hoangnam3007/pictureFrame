package com.demo.domain;

import static org.assertj.core.api.Assertions.assertThat;

public class AdvertisementAsserts {

    /**
     * Asserts that the entity has all properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertAdvertisementAllPropertiesEquals(Advertisement expected, Advertisement actual) {
        assertAdvertisementAutoGeneratedPropertiesEquals(expected, actual);
        assertAdvertisementAllUpdatablePropertiesEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all updatable properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertAdvertisementAllUpdatablePropertiesEquals(Advertisement expected, Advertisement actual) {
        assertAdvertisementUpdatableFieldsEquals(expected, actual);
        assertAdvertisementUpdatableRelationshipsEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all the auto generated properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertAdvertisementAutoGeneratedPropertiesEquals(Advertisement expected, Advertisement actual) {
        assertThat(expected)
            .as("Verify Advertisement auto generated properties")
            .satisfies(e -> assertThat(e.getId()).as("check id").isEqualTo(actual.getId()));
    }

    /**
     * Asserts that the entity has all the updatable fields set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertAdvertisementUpdatableFieldsEquals(Advertisement expected, Advertisement actual) {
        assertThat(expected)
            .as("Verify Advertisement relevant properties")
            .satisfies(e -> assertThat(e.getBrand()).as("check brand").isEqualTo(actual.getBrand()))
            .satisfies(e -> assertThat(e.getImagePath()).as("check imagePath").isEqualTo(actual.getImagePath()))
            .satisfies(e -> assertThat(e.getRedirectUrl()).as("check redirectUrl").isEqualTo(actual.getRedirectUrl()))
            .satisfies(e -> assertThat(e.getActive()).as("check active").isEqualTo(actual.getActive()))
            .satisfies(e -> assertThat(e.getCreatedAt()).as("check createdAt").isEqualTo(actual.getCreatedAt()))
            .satisfies(e -> assertThat(e.getUpdatedAt()).as("check updatedAt").isEqualTo(actual.getUpdatedAt()));
    }

    /**
     * Asserts that the entity has all the updatable relationships set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertAdvertisementUpdatableRelationshipsEquals(Advertisement expected, Advertisement actual) {
        // empty method
    }
}