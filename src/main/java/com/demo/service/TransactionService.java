package com.demo.service;

import com.demo.repository.TransactionRepository;
import com.demo.service.dto.TransactionDTO;
import com.demo.service.mapper.TransactionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.demo.domain.Transaction}.
 */
@Service
@Transactional
public class TransactionService {

    private static final Logger LOG = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;

    private final TransactionMapper transactionMapper;

    public TransactionService(TransactionRepository transactionRepository, TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.transactionMapper = transactionMapper;
    }

    /**
     * Save a transaction.
     *
     * @param transactionDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<TransactionDTO> save(TransactionDTO transactionDTO) {
        LOG.debug("Request to save Transaction : {}", transactionDTO);
        return transactionRepository.save(transactionMapper.toEntity(transactionDTO)).map(transactionMapper::toDto);
    }

    /**
     * Update a transaction.
     *
     * @param transactionDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<TransactionDTO> update(TransactionDTO transactionDTO) {
        LOG.debug("Request to update Transaction : {}", transactionDTO);
        return transactionRepository.save(transactionMapper.toEntity(transactionDTO)).map(transactionMapper::toDto);
    }

    /**
     * Partially update a transaction.
     *
     * @param transactionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<TransactionDTO> partialUpdate(TransactionDTO transactionDTO) {
        LOG.debug("Request to partially update Transaction : {}", transactionDTO);

        return transactionRepository
            .findById(transactionDTO.getId())
            .map(existingTransaction -> {
                transactionMapper.partialUpdate(existingTransaction, transactionDTO);

                return existingTransaction;
            })
            .flatMap(transactionRepository::save)
            .map(transactionMapper::toDto);
    }

    /**
     * Get all the transactions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Flux<TransactionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Transactions");
        return transactionRepository.findAllBy(pageable).map(transactionMapper::toDto);
    }

    /**
     * Get all the transactions with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Flux<TransactionDTO> findAllWithEagerRelationships(Pageable pageable) {
        return transactionRepository.findAllWithEagerRelationships(pageable).map(transactionMapper::toDto);
    }

    /**
     * Returns the number of transactions available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return transactionRepository.count();
    }

    /**
     * Get one transaction by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Mono<TransactionDTO> findOne(Long id) {
        LOG.debug("Request to get Transaction : {}", id);
        return transactionRepository.findOneWithEagerRelationships(id).map(transactionMapper::toDto);
    }

    /**
     * Delete the transaction by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(Long id) {
        LOG.debug("Request to delete Transaction : {}", id);
        return transactionRepository.deleteById(id);
    }
}
