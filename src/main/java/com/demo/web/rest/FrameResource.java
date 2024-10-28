package com.demo.web.rest;

import com.demo.repository.FrameRepository;
import com.demo.service.FrameService;
import com.demo.service.dto.FrameDTO;
import com.demo.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.ForwardedHeaderUtils;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link com.demo.domain.Frame}.
 */
@RestController
@RequestMapping("/api/frames")
public class FrameResource {

    private static final Logger LOG = LoggerFactory.getLogger(FrameResource.class);

    private static final String ENTITY_NAME = "frame";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FrameService frameService;

    private final FrameRepository frameRepository;

    public FrameResource(FrameService frameService, FrameRepository frameRepository) {
        this.frameService = frameService;
        this.frameRepository = frameRepository;
    }

    /**
     * {@code POST  /frames} : Create a new frame.
     *
     * @param frameDTO the frameDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new frameDTO, or with status {@code 400 (Bad Request)} if the frame has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<FrameDTO>> createFrame(@Valid @RequestBody FrameDTO frameDTO) throws URISyntaxException {
        LOG.debug("REST request to save Frame : {}", frameDTO);
        if (frameDTO.getId() != null) {
            throw new BadRequestAlertException("A new frame cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return frameService
            .save(frameDTO)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/frames/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /frames/:id} : Updates an existing frame.
     *
     * @param id the id of the frameDTO to save.
     * @param frameDTO the frameDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated frameDTO,
     * or with status {@code 400 (Bad Request)} if the frameDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the frameDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<FrameDTO>> updateFrame(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FrameDTO frameDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Frame : {}, {}", id, frameDTO);
        if (frameDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, frameDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return frameRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return frameService
                    .update(frameDTO)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /frames/:id} : Partial updates given fields of an existing frame, field will ignore if it is null
     *
     * @param id the id of the frameDTO to save.
     * @param frameDTO the frameDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated frameDTO,
     * or with status {@code 400 (Bad Request)} if the frameDTO is not valid,
     * or with status {@code 404 (Not Found)} if the frameDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the frameDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<FrameDTO>> partialUpdateFrame(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FrameDTO frameDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Frame partially : {}, {}", id, frameDTO);
        if (frameDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, frameDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return frameRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<FrameDTO> result = frameService.partialUpdate(frameDTO);

                return result
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(res ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, res.getId().toString()))
                            .body(res)
                    );
            });
    }

    /**
     * {@code GET  /frames} : get all the frames.
     *
     * @param pageable the pagination information.
     * @param request a {@link ServerHttpRequest} request.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of frames in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<List<FrameDTO>>> getAllFrames(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        ServerHttpRequest request,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Frames");
        return frameService
            .countAll()
            .zipWith(frameService.findAll(pageable).collectList())
            .map(countWithEntities ->
                ResponseEntity.ok()
                    .headers(
                        PaginationUtil.generatePaginationHttpHeaders(
                            ForwardedHeaderUtils.adaptFromForwardedHeaders(request.getURI(), request.getHeaders()),
                            new PageImpl<>(countWithEntities.getT2(), pageable, countWithEntities.getT1())
                        )
                    )
                    .body(countWithEntities.getT2())
            );
    }

    /**
     * {@code GET  /frames/:id} : get the "id" frame.
     *
     * @param id the id of the frameDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the frameDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<FrameDTO>> getFrame(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Frame : {}", id);
        Mono<FrameDTO> frameDTO = frameService.findOne(id);
        return ResponseUtil.wrapOrNotFound(frameDTO);
    }

    /**
     * {@code DELETE  /frames/:id} : delete the "id" frame.
     *
     * @param id the id of the frameDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteFrame(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Frame : {}", id);
        return frameService
            .delete(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent()
                        .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                        .build()
                )
            );
    }
}
