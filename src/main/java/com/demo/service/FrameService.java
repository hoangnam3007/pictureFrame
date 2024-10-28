package com.demo.service;

import com.demo.repository.FrameRepository;
import com.demo.service.dto.FrameDTO;
import com.demo.service.mapper.FrameMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.demo.domain.Frame}.
 */
@Service
@Transactional
public class FrameService {

    private static final Logger LOG = LoggerFactory.getLogger(FrameService.class);

    private final FrameRepository frameRepository;

    private final FrameMapper frameMapper;

    public FrameService(FrameRepository frameRepository, FrameMapper frameMapper) {
        this.frameRepository = frameRepository;
        this.frameMapper = frameMapper;
    }

    /**
     * Save a frame.
     *
     * @param frameDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<FrameDTO> save(FrameDTO frameDTO) {
        LOG.debug("Request to save Frame : {}", frameDTO);
        return frameRepository.save(frameMapper.toEntity(frameDTO)).map(frameMapper::toDto);
    }

    /**
     * Update a frame.
     *
     * @param frameDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<FrameDTO> update(FrameDTO frameDTO) {
        LOG.debug("Request to update Frame : {}", frameDTO);
        return frameRepository.save(frameMapper.toEntity(frameDTO)).map(frameMapper::toDto);
    }

    /**
     * Partially update a frame.
     *
     * @param frameDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<FrameDTO> partialUpdate(FrameDTO frameDTO) {
        LOG.debug("Request to partially update Frame : {}", frameDTO);

        return frameRepository
            .findById(frameDTO.getId())
            .map(existingFrame -> {
                frameMapper.partialUpdate(existingFrame, frameDTO);

                return existingFrame;
            })
            .flatMap(frameRepository::save)
            .map(frameMapper::toDto);
    }

    /**
     * Get all the frames.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Flux<FrameDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Frames");
        return frameRepository.findAllBy(pageable).map(frameMapper::toDto);
    }

    /**
     * Get all the frames with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Flux<FrameDTO> findAllWithEagerRelationships(Pageable pageable) {
        return frameRepository.findAllWithEagerRelationships(pageable).map(frameMapper::toDto);
    }

    /**
     * Returns the number of frames available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return frameRepository.count();
    }

    /**
     * Get one frame by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Mono<FrameDTO> findOne(Long id) {
        LOG.debug("Request to get Frame : {}", id);
        return frameRepository.findOneWithEagerRelationships(id).map(frameMapper::toDto);
    }

    /**
     * Delete the frame by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(Long id) {
        LOG.debug("Request to delete Frame : {}", id);
        return frameRepository.deleteById(id);
    }
}
