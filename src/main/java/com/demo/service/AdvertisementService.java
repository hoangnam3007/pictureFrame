package com.demo.service;

import com.demo.repository.AdvertisementRepository;
import com.demo.service.dto.AdvertisementDTO;
import com.demo.service.mapper.AdvertisementMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.demo.domain.Advertisement}.
 */
@Service
@Transactional
public class AdvertisementService {

    private static final Logger LOG = LoggerFactory.getLogger(AdvertisementService.class);

    private final AdvertisementRepository advertisementRepository;

    private final AdvertisementMapper advertisementMapper;

    public AdvertisementService(AdvertisementRepository advertisementRepository, AdvertisementMapper advertisementMapper) {
        this.advertisementRepository = advertisementRepository;
        this.advertisementMapper = advertisementMapper;
    }

    /**
     * Save a advertisement.
     *
     * @param advertisementDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<AdvertisementDTO> save(AdvertisementDTO advertisementDTO) {
        LOG.debug("Request to save Advertisement : {}", advertisementDTO);
        return advertisementRepository.save(advertisementMapper.toEntity(advertisementDTO)).map(advertisementMapper::toDto);
    }

    /**
     * Update a advertisement.
     *
     * @param advertisementDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<AdvertisementDTO> update(AdvertisementDTO advertisementDTO) {
        LOG.debug("Request to update Advertisement : {}", advertisementDTO);
        return advertisementRepository.save(advertisementMapper.toEntity(advertisementDTO)).map(advertisementMapper::toDto);
    }

    /**
     * Partially update a advertisement.
     *
     * @param advertisementDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<AdvertisementDTO> partialUpdate(AdvertisementDTO advertisementDTO) {
        LOG.debug("Request to partially update Advertisement : {}", advertisementDTO);

        return advertisementRepository
            .findById(advertisementDTO.getId())
            .map(existingAdvertisement -> {
                advertisementMapper.partialUpdate(existingAdvertisement, advertisementDTO);

                return existingAdvertisement;
            })
            .flatMap(advertisementRepository::save)
            .map(advertisementMapper::toDto);
    }

    /**
     * Get all the advertisements.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Flux<AdvertisementDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Advertisements");
        return advertisementRepository.findAllBy(pageable).map(advertisementMapper::toDto);
    }

    /**
     * Returns the number of advertisements available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return advertisementRepository.count();
    }

    /**
     * Get one advertisement by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Mono<AdvertisementDTO> findOne(Long id) {
        LOG.debug("Request to get Advertisement : {}", id);
        return advertisementRepository.findById(id).map(advertisementMapper::toDto);
    }

    /**
     * Delete the advertisement by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(Long id) {
        LOG.debug("Request to delete Advertisement : {}", id);
        return advertisementRepository.deleteById(id);
    }
}
