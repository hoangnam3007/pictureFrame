package com.demo.web.rest;

import com.demo.repository.AdvertisementRepository;
import com.demo.service.AdvertisementService;
import com.demo.service.dto.AdvertisementDTO;
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
 * REST controller for managing {@link com.demo.domain.Advertisement}.
 */
@RestController
@RequestMapping("/api/advertisements")
public class AdvertisementResource {

    private static final Logger LOG = LoggerFactory.getLogger(AdvertisementResource.class);

    private static final String ENTITY_NAME = "advertisement";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AdvertisementService advertisementService;

    private final AdvertisementRepository advertisementRepository;

    public AdvertisementResource(AdvertisementService advertisementService, AdvertisementRepository advertisementRepository) {
        this.advertisementService = advertisementService;
        this.advertisementRepository = advertisementRepository;
    }

    /**
     * {@code POST  /advertisements} : Create a new advertisement.
     *
     * @param advertisementDTO the advertisementDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new advertisementDTO, or with status {@code 400 (Bad Request)} if the advertisement has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<AdvertisementDTO>> createAdvertisement(@Valid @RequestBody AdvertisementDTO advertisementDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save Advertisement : {}", advertisementDTO);
        if (advertisementDTO.getId() != null) {
            throw new BadRequestAlertException("A new advertisement cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return advertisementService
            .save(advertisementDTO)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/advertisements/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /advertisements/:id} : Updates an existing advertisement.
     *
     * @param id the id of the advertisementDTO to save.
     * @param advertisementDTO the advertisementDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated advertisementDTO,
     * or with status {@code 400 (Bad Request)} if the advertisementDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the advertisementDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<AdvertisementDTO>> updateAdvertisement(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AdvertisementDTO advertisementDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Advertisement : {}, {}", id, advertisementDTO);
        if (advertisementDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, advertisementDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return advertisementRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return advertisementService
                    .update(advertisementDTO)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /advertisements/:id} : Partial updates given fields of an existing advertisement, field will ignore if it is null
     *
     * @param id the id of the advertisementDTO to save.
     * @param advertisementDTO the advertisementDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated advertisementDTO,
     * or with status {@code 400 (Bad Request)} if the advertisementDTO is not valid,
     * or with status {@code 404 (Not Found)} if the advertisementDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the advertisementDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<AdvertisementDTO>> partialUpdateAdvertisement(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AdvertisementDTO advertisementDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Advertisement partially : {}, {}", id, advertisementDTO);
        if (advertisementDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, advertisementDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return advertisementRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<AdvertisementDTO> result = advertisementService.partialUpdate(advertisementDTO);

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
     * {@code GET  /advertisements} : get all the advertisements.
     *
     * @param pageable the pagination information.
     * @param request a {@link ServerHttpRequest} request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of advertisements in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<List<AdvertisementDTO>>> getAllAdvertisements(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        ServerHttpRequest request
    ) {
        LOG.debug("REST request to get a page of Advertisements");
        return advertisementService
            .countAll()
            .zipWith(advertisementService.findAll(pageable).collectList())
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
     * {@code GET  /advertisements/:id} : get the "id" advertisement.
     *
     * @param id the id of the advertisementDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the advertisementDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<AdvertisementDTO>> getAdvertisement(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Advertisement : {}", id);
        Mono<AdvertisementDTO> advertisementDTO = advertisementService.findOne(id);
        return ResponseUtil.wrapOrNotFound(advertisementDTO);
    }

    /**
     * {@code DELETE  /advertisements/:id} : delete the "id" advertisement.
     *
     * @param id the id of the advertisementDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteAdvertisement(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Advertisement : {}", id);
        return advertisementService
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
