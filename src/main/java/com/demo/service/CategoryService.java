package com.demo.service;

import com.demo.repository.CategoryRepository;
import com.demo.service.dto.CategoryDTO;
import com.demo.service.mapper.CategoryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.demo.domain.Category}.
 */
@Service
@Transactional
public class CategoryService {

    private static final Logger LOG = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;

    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    /**
     * Save a category.
     *
     * @param categoryDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<CategoryDTO> save(CategoryDTO categoryDTO) {
        LOG.debug("Request to save Category : {}", categoryDTO);
        return categoryRepository.save(categoryMapper.toEntity(categoryDTO)).map(categoryMapper::toDto);
    }

    /**
     * Update a category.
     *
     * @param categoryDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<CategoryDTO> update(CategoryDTO categoryDTO) {
        LOG.debug("Request to update Category : {}", categoryDTO);
        return categoryRepository.save(categoryMapper.toEntity(categoryDTO)).map(categoryMapper::toDto);
    }

    /**
     * Partially update a category.
     *
     * @param categoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<CategoryDTO> partialUpdate(CategoryDTO categoryDTO) {
        LOG.debug("Request to partially update Category : {}", categoryDTO);

        return categoryRepository
            .findById(categoryDTO.getId())
            .map(existingCategory -> {
                categoryMapper.partialUpdate(existingCategory, categoryDTO);

                return existingCategory;
            })
            .flatMap(categoryRepository::save)
            .map(categoryMapper::toDto);
    }

    /**
     * Get all the categories.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Flux<CategoryDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Categories");
        return categoryRepository.findAllBy(pageable).map(categoryMapper::toDto);
    }

    /**
     * Returns the number of categories available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return categoryRepository.count();
    }

    /**
     * Get one category by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Mono<CategoryDTO> findOne(Long id) {
        LOG.debug("Request to get Category : {}", id);
        return categoryRepository.findById(id).map(categoryMapper::toDto);
    }

    /**
     * Delete the category by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(Long id) {
        LOG.debug("Request to delete Category : {}", id);
        return categoryRepository.deleteById(id);
    }
}
