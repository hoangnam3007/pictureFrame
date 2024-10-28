package com.demo.web.rest;

import static com.demo.domain.AdvertisementAsserts.*;
import static com.demo.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;

import com.demo.IntegrationTest;
import com.demo.domain.Advertisement;
import com.demo.repository.AdvertisementRepository;
import com.demo.repository.EntityManager;
import com.demo.service.dto.AdvertisementDTO;
import com.demo.service.mapper.AdvertisementMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link AdvertisementResource} REST controller.
 */
@IntegrationTest
@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_ENTITY_TIMEOUT)
@WithMockUser
class AdvertisementResourceIT {

    private static final String DEFAULT_BRAND = "AAAAAAAAAA";
    private static final String UPDATED_BRAND = "BBBBBBBBBB";

    private static final String DEFAULT_IMAGE_PATH = "AAAAAAAAAA";
    private static final String UPDATED_IMAGE_PATH = "BBBBBBBBBB";

    private static final String DEFAULT_REDIRECT_URL = "AAAAAAAAAA";
    private static final String UPDATED_REDIRECT_URL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_UPDATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/advertisements";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private AdvertisementMapper advertisementMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private WebTestClient webTestClient;

    private Advertisement advertisement;

    private Advertisement insertedAdvertisement;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Advertisement createEntity() {
        return new Advertisement()
            .brand(DEFAULT_BRAND)
            .imagePath(DEFAULT_IMAGE_PATH)
            .redirectUrl(DEFAULT_REDIRECT_URL)
            .active(DEFAULT_ACTIVE)
            .createdAt(DEFAULT_CREATED_AT)
            .updatedAt(DEFAULT_UPDATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Advertisement createUpdatedEntity() {
        return new Advertisement()
            .brand(UPDATED_BRAND)
            .imagePath(UPDATED_IMAGE_PATH)
            .redirectUrl(UPDATED_REDIRECT_URL)
            .active(UPDATED_ACTIVE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
    }

    public static void deleteEntities(EntityManager em) {
        try {
            em.deleteAll(Advertisement.class).block();
        } catch (Exception e) {
            // It can fail, if other entities are still referring this - it will be removed later.
        }
    }

    @BeforeEach
    public void initTest() {
        advertisement = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedAdvertisement != null) {
            advertisementRepository.delete(insertedAdvertisement).block();
            insertedAdvertisement = null;
        }
        deleteEntities(em);
    }

    @Test
    void createAdvertisement() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);
        var returnedAdvertisementDTO = webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isCreated()
            .expectBody(AdvertisementDTO.class)
            .returnResult()
            .getResponseBody();

        // Validate the Advertisement in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAdvertisement = advertisementMapper.toEntity(returnedAdvertisementDTO);
        assertAdvertisementUpdatableFieldsEquals(returnedAdvertisement, getPersistedAdvertisement(returnedAdvertisement));

        insertedAdvertisement = returnedAdvertisement;
    }

    @Test
    void createAdvertisementWithExistingId() throws Exception {
        // Create the Advertisement with an existing ID
        advertisement.setId(1L);
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    void checkBrandIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advertisement.setBrand(null);

        // Create the Advertisement, which fails.
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkImagePathIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advertisement.setImagePath(null);

        // Create the Advertisement, which fails.
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkRedirectUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advertisement.setRedirectUrl(null);

        // Create the Advertisement, which fails.
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advertisement.setActive(null);

        // Create the Advertisement, which fails.
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void getAllAdvertisements() {
        // Initialize the database
        insertedAdvertisement = advertisementRepository.save(advertisement).block();

        // Get all the advertisementList
        webTestClient
            .get()
            .uri(ENTITY_API_URL + "?sort=id,desc")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.[*].id")
            .value(hasItem(advertisement.getId().intValue()))
            .jsonPath("$.[*].brand")
            .value(hasItem(DEFAULT_BRAND))
            .jsonPath("$.[*].imagePath")
            .value(hasItem(DEFAULT_IMAGE_PATH))
            .jsonPath("$.[*].redirectUrl")
            .value(hasItem(DEFAULT_REDIRECT_URL))
            .jsonPath("$.[*].active")
            .value(hasItem(DEFAULT_ACTIVE.booleanValue()))
            .jsonPath("$.[*].createdAt")
            .value(hasItem(DEFAULT_CREATED_AT.toString()))
            .jsonPath("$.[*].updatedAt")
            .value(hasItem(DEFAULT_UPDATED_AT.toString()));
    }

    @Test
    void getAdvertisement() {
        // Initialize the database
        insertedAdvertisement = advertisementRepository.save(advertisement).block();

        // Get the advertisement
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, advertisement.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id")
            .value(is(advertisement.getId().intValue()))
            .jsonPath("$.brand")
            .value(is(DEFAULT_BRAND))
            .jsonPath("$.imagePath")
            .value(is(DEFAULT_IMAGE_PATH))
            .jsonPath("$.redirectUrl")
            .value(is(DEFAULT_REDIRECT_URL))
            .jsonPath("$.active")
            .value(is(DEFAULT_ACTIVE.booleanValue()))
            .jsonPath("$.createdAt")
            .value(is(DEFAULT_CREATED_AT.toString()))
            .jsonPath("$.updatedAt")
            .value(is(DEFAULT_UPDATED_AT.toString()));
    }

    @Test
    void getNonExistingAdvertisement() {
        // Get the advertisement
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, Long.MAX_VALUE)
            .accept(MediaType.APPLICATION_PROBLEM_JSON)
            .exchange()
            .expectStatus()
            .isNotFound();
    }

    @Test
    void putExistingAdvertisement() throws Exception {
        // Initialize the database
        insertedAdvertisement = advertisementRepository.save(advertisement).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the advertisement
        Advertisement updatedAdvertisement = advertisementRepository.findById(advertisement.getId()).block();
        updatedAdvertisement
            .brand(UPDATED_BRAND)
            .imagePath(UPDATED_IMAGE_PATH)
            .redirectUrl(UPDATED_REDIRECT_URL)
            .active(UPDATED_ACTIVE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(updatedAdvertisement);

        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, advertisementDTO.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAdvertisementToMatchAllProperties(updatedAdvertisement);
    }

    @Test
    void putNonExistingAdvertisement() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advertisement.setId(longCount.incrementAndGet());

        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, advertisementDTO.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithIdMismatchAdvertisement() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advertisement.setId(longCount.incrementAndGet());

        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, longCount.incrementAndGet())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithMissingIdPathParamAdvertisement() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advertisement.setId(longCount.incrementAndGet());

        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void partialUpdateAdvertisementWithPatch() throws Exception {
        // Initialize the database
        insertedAdvertisement = advertisementRepository.save(advertisement).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the advertisement using partial update
        Advertisement partialUpdatedAdvertisement = new Advertisement();
        partialUpdatedAdvertisement.setId(advertisement.getId());

        partialUpdatedAdvertisement.imagePath(UPDATED_IMAGE_PATH);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedAdvertisement.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedAdvertisement))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Advertisement in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAdvertisementUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedAdvertisement, advertisement),
            getPersistedAdvertisement(advertisement)
        );
    }

    @Test
    void fullUpdateAdvertisementWithPatch() throws Exception {
        // Initialize the database
        insertedAdvertisement = advertisementRepository.save(advertisement).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the advertisement using partial update
        Advertisement partialUpdatedAdvertisement = new Advertisement();
        partialUpdatedAdvertisement.setId(advertisement.getId());

        partialUpdatedAdvertisement
            .brand(UPDATED_BRAND)
            .imagePath(UPDATED_IMAGE_PATH)
            .redirectUrl(UPDATED_REDIRECT_URL)
            .active(UPDATED_ACTIVE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedAdvertisement.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedAdvertisement))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Advertisement in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAdvertisementUpdatableFieldsEquals(partialUpdatedAdvertisement, getPersistedAdvertisement(partialUpdatedAdvertisement));
    }

    @Test
    void patchNonExistingAdvertisement() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advertisement.setId(longCount.incrementAndGet());

        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, advertisementDTO.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithIdMismatchAdvertisement() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advertisement.setId(longCount.incrementAndGet());

        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, longCount.incrementAndGet())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithMissingIdPathParamAdvertisement() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advertisement.setId(longCount.incrementAndGet());

        // Create the Advertisement
        AdvertisementDTO advertisementDTO = advertisementMapper.toDto(advertisement);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(advertisementDTO))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Advertisement in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void deleteAdvertisement() {
        // Initialize the database
        insertedAdvertisement = advertisementRepository.save(advertisement).block();

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the advertisement
        webTestClient
            .delete()
            .uri(ENTITY_API_URL_ID, advertisement.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isNoContent();

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return advertisementRepository.count().block();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Advertisement getPersistedAdvertisement(Advertisement advertisement) {
        return advertisementRepository.findById(advertisement.getId()).block();
    }

    protected void assertPersistedAdvertisementToMatchAllProperties(Advertisement expectedAdvertisement) {
        // Test fails because reactive api returns an empty object instead of null
        // assertAdvertisementAllPropertiesEquals(expectedAdvertisement, getPersistedAdvertisement(expectedAdvertisement));
        assertAdvertisementUpdatableFieldsEquals(expectedAdvertisement, getPersistedAdvertisement(expectedAdvertisement));
    }

    protected void assertPersistedAdvertisementToMatchUpdatableProperties(Advertisement expectedAdvertisement) {
        // Test fails because reactive api returns an empty object instead of null
        // assertAdvertisementAllUpdatablePropertiesEquals(expectedAdvertisement, getPersistedAdvertisement(expectedAdvertisement));
        assertAdvertisementUpdatableFieldsEquals(expectedAdvertisement, getPersistedAdvertisement(expectedAdvertisement));
    }
}
