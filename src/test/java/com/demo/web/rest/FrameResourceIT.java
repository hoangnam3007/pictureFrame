package com.demo.web.rest;

import static com.demo.domain.FrameAsserts.*;
import static com.demo.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;

import com.demo.IntegrationTest;
import com.demo.domain.Frame;
import com.demo.domain.enumeration.FrameType;
import com.demo.repository.EntityManager;
import com.demo.repository.FrameRepository;
import com.demo.repository.UserRepository;
import com.demo.service.FrameService;
import com.demo.service.dto.FrameDTO;
import com.demo.service.mapper.FrameMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

/**
 * Integration tests for the {@link FrameResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_ENTITY_TIMEOUT)
@WithMockUser
class FrameResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final FrameType DEFAULT_TYPE = FrameType.PRIVATE;
    private static final FrameType UPDATED_TYPE = FrameType.PUBLIC;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_GUIDELINE_URL = "AAAAAAAAAA";
    private static final String UPDATED_GUIDELINE_URL = "BBBBBBBBBB";

    private static final String DEFAULT_IMAGE_PATH = "AAAAAAAAAA";
    private static final String UPDATED_IMAGE_PATH = "BBBBBBBBBB";

    private static final Integer DEFAULT_USAGE_COUNT = 1;
    private static final Integer UPDATED_USAGE_COUNT = 2;

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_UPDATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/frames";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FrameRepository frameRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private FrameRepository frameRepositoryMock;

    @Autowired
    private FrameMapper frameMapper;

    @Mock
    private FrameService frameServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private WebTestClient webTestClient;

    private Frame frame;

    private Frame insertedFrame;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Frame createEntity() {
        return new Frame()
            .title(DEFAULT_TITLE)
            .type(DEFAULT_TYPE)
            .description(DEFAULT_DESCRIPTION)
            .guidelineUrl(DEFAULT_GUIDELINE_URL)
            .imagePath(DEFAULT_IMAGE_PATH)
            .usageCount(DEFAULT_USAGE_COUNT)
            .createdAt(DEFAULT_CREATED_AT)
            .updatedAt(DEFAULT_UPDATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Frame createUpdatedEntity() {
        return new Frame()
            .title(UPDATED_TITLE)
            .type(UPDATED_TYPE)
            .description(UPDATED_DESCRIPTION)
            .guidelineUrl(UPDATED_GUIDELINE_URL)
            .imagePath(UPDATED_IMAGE_PATH)
            .usageCount(UPDATED_USAGE_COUNT)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
    }

    public static void deleteEntities(EntityManager em) {
        try {
            em.deleteAll(Frame.class).block();
        } catch (Exception e) {
            // It can fail, if other entities are still referring this - it will be removed later.
        }
    }

    @BeforeEach
    public void initTest() {
        frame = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedFrame != null) {
            frameRepository.delete(insertedFrame).block();
            insertedFrame = null;
        }
        deleteEntities(em);
        userRepository.deleteAllUserAuthorities().block();
        userRepository.deleteAll().block();
    }

    @Test
    void createFrame() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);
        var returnedFrameDTO = webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isCreated()
            .expectBody(FrameDTO.class)
            .returnResult()
            .getResponseBody();

        // Validate the Frame in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedFrame = frameMapper.toEntity(returnedFrameDTO);
        assertFrameUpdatableFieldsEquals(returnedFrame, getPersistedFrame(returnedFrame));

        insertedFrame = returnedFrame;
    }

    @Test
    void createFrameWithExistingId() throws Exception {
        // Create the Frame with an existing ID
        frame.setId(1L);
        FrameDTO frameDTO = frameMapper.toDto(frame);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        frame.setTitle(null);

        // Create the Frame, which fails.
        FrameDTO frameDTO = frameMapper.toDto(frame);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        frame.setType(null);

        // Create the Frame, which fails.
        FrameDTO frameDTO = frameMapper.toDto(frame);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkImagePathIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        frame.setImagePath(null);

        // Create the Frame, which fails.
        FrameDTO frameDTO = frameMapper.toDto(frame);

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void getAllFrames() {
        // Initialize the database
        insertedFrame = frameRepository.save(frame).block();

        // Get all the frameList
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
            .value(hasItem(frame.getId().intValue()))
            .jsonPath("$.[*].title")
            .value(hasItem(DEFAULT_TITLE))
            .jsonPath("$.[*].type")
            .value(hasItem(DEFAULT_TYPE.toString()))
            .jsonPath("$.[*].description")
            .value(hasItem(DEFAULT_DESCRIPTION.toString()))
            .jsonPath("$.[*].guidelineUrl")
            .value(hasItem(DEFAULT_GUIDELINE_URL))
            .jsonPath("$.[*].imagePath")
            .value(hasItem(DEFAULT_IMAGE_PATH))
            .jsonPath("$.[*].usageCount")
            .value(hasItem(DEFAULT_USAGE_COUNT))
            .jsonPath("$.[*].createdAt")
            .value(hasItem(DEFAULT_CREATED_AT.toString()))
            .jsonPath("$.[*].updatedAt")
            .value(hasItem(DEFAULT_UPDATED_AT.toString()));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFramesWithEagerRelationshipsIsEnabled() {
        when(frameServiceMock.findAllWithEagerRelationships(any())).thenReturn(Flux.empty());

        webTestClient.get().uri(ENTITY_API_URL + "?eagerload=true").exchange().expectStatus().isOk();

        verify(frameServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFramesWithEagerRelationshipsIsNotEnabled() {
        when(frameServiceMock.findAllWithEagerRelationships(any())).thenReturn(Flux.empty());

        webTestClient.get().uri(ENTITY_API_URL + "?eagerload=false").exchange().expectStatus().isOk();
        verify(frameRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    void getFrame() {
        // Initialize the database
        insertedFrame = frameRepository.save(frame).block();

        // Get the frame
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, frame.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id")
            .value(is(frame.getId().intValue()))
            .jsonPath("$.title")
            .value(is(DEFAULT_TITLE))
            .jsonPath("$.type")
            .value(is(DEFAULT_TYPE.toString()))
            .jsonPath("$.description")
            .value(is(DEFAULT_DESCRIPTION.toString()))
            .jsonPath("$.guidelineUrl")
            .value(is(DEFAULT_GUIDELINE_URL))
            .jsonPath("$.imagePath")
            .value(is(DEFAULT_IMAGE_PATH))
            .jsonPath("$.usageCount")
            .value(is(DEFAULT_USAGE_COUNT))
            .jsonPath("$.createdAt")
            .value(is(DEFAULT_CREATED_AT.toString()))
            .jsonPath("$.updatedAt")
            .value(is(DEFAULT_UPDATED_AT.toString()));
    }

    @Test
    void getNonExistingFrame() {
        // Get the frame
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, Long.MAX_VALUE)
            .accept(MediaType.APPLICATION_PROBLEM_JSON)
            .exchange()
            .expectStatus()
            .isNotFound();
    }

    @Test
    void putExistingFrame() throws Exception {
        // Initialize the database
        insertedFrame = frameRepository.save(frame).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the frame
        Frame updatedFrame = frameRepository.findById(frame.getId()).block();
        updatedFrame
            .title(UPDATED_TITLE)
            .type(UPDATED_TYPE)
            .description(UPDATED_DESCRIPTION)
            .guidelineUrl(UPDATED_GUIDELINE_URL)
            .imagePath(UPDATED_IMAGE_PATH)
            .usageCount(UPDATED_USAGE_COUNT)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        FrameDTO frameDTO = frameMapper.toDto(updatedFrame);

        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, frameDTO.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFrameToMatchAllProperties(updatedFrame);
    }

    @Test
    void putNonExistingFrame() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        frame.setId(longCount.incrementAndGet());

        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, frameDTO.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithIdMismatchFrame() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        frame.setId(longCount.incrementAndGet());

        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, longCount.incrementAndGet())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithMissingIdPathParamFrame() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        frame.setId(longCount.incrementAndGet());

        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void partialUpdateFrameWithPatch() throws Exception {
        // Initialize the database
        insertedFrame = frameRepository.save(frame).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the frame using partial update
        Frame partialUpdatedFrame = new Frame();
        partialUpdatedFrame.setId(frame.getId());

        partialUpdatedFrame
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .guidelineUrl(UPDATED_GUIDELINE_URL)
            .imagePath(UPDATED_IMAGE_PATH)
            .usageCount(UPDATED_USAGE_COUNT);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedFrame.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedFrame))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Frame in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFrameUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedFrame, frame), getPersistedFrame(frame));
    }

    @Test
    void fullUpdateFrameWithPatch() throws Exception {
        // Initialize the database
        insertedFrame = frameRepository.save(frame).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the frame using partial update
        Frame partialUpdatedFrame = new Frame();
        partialUpdatedFrame.setId(frame.getId());

        partialUpdatedFrame
            .title(UPDATED_TITLE)
            .type(UPDATED_TYPE)
            .description(UPDATED_DESCRIPTION)
            .guidelineUrl(UPDATED_GUIDELINE_URL)
            .imagePath(UPDATED_IMAGE_PATH)
            .usageCount(UPDATED_USAGE_COUNT)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedFrame.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedFrame))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Frame in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFrameUpdatableFieldsEquals(partialUpdatedFrame, getPersistedFrame(partialUpdatedFrame));
    }

    @Test
    void patchNonExistingFrame() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        frame.setId(longCount.incrementAndGet());

        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, frameDTO.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithIdMismatchFrame() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        frame.setId(longCount.incrementAndGet());

        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, longCount.incrementAndGet())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithMissingIdPathParamFrame() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        frame.setId(longCount.incrementAndGet());

        // Create the Frame
        FrameDTO frameDTO = frameMapper.toDto(frame);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(frameDTO))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Frame in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void deleteFrame() {
        // Initialize the database
        insertedFrame = frameRepository.save(frame).block();

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the frame
        webTestClient
            .delete()
            .uri(ENTITY_API_URL_ID, frame.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isNoContent();

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return frameRepository.count().block();
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

    protected Frame getPersistedFrame(Frame frame) {
        return frameRepository.findById(frame.getId()).block();
    }

    protected void assertPersistedFrameToMatchAllProperties(Frame expectedFrame) {
        // Test fails because reactive api returns an empty object instead of null
        // assertFrameAllPropertiesEquals(expectedFrame, getPersistedFrame(expectedFrame));
        assertFrameUpdatableFieldsEquals(expectedFrame, getPersistedFrame(expectedFrame));
    }

    protected void assertPersistedFrameToMatchUpdatableProperties(Frame expectedFrame) {
        // Test fails because reactive api returns an empty object instead of null
        // assertFrameAllUpdatablePropertiesEquals(expectedFrame, getPersistedFrame(expectedFrame));
        assertFrameUpdatableFieldsEquals(expectedFrame, getPersistedFrame(expectedFrame));
    }
}
