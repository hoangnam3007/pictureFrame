package com.demo.repository;

import com.demo.domain.Frame;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the Frame entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FrameRepository extends ReactiveCrudRepository<Frame, Long>, FrameRepositoryInternal {
    Flux<Frame> findAllBy(Pageable pageable);

    @Override
    Mono<Frame> findOneWithEagerRelationships(Long id);

    @Override
    Flux<Frame> findAllWithEagerRelationships();

    @Override
    Flux<Frame> findAllWithEagerRelationships(Pageable page);

    @Query("SELECT * FROM frame entity WHERE entity.creator_id = :id")
    Flux<Frame> findByCreator(Long id);

    @Query("SELECT * FROM frame entity WHERE entity.creator_id IS NULL")
    Flux<Frame> findAllWhereCreatorIsNull();

    @Override
    <S extends Frame> Mono<S> save(S entity);

    @Override
    Flux<Frame> findAll();

    @Override
    Mono<Frame> findById(Long id);

    @Override
    Mono<Void> deleteById(Long id);
}

interface FrameRepositoryInternal {
    <S extends Frame> Mono<S> save(S entity);

    Flux<Frame> findAllBy(Pageable pageable);

    Flux<Frame> findAll();

    Mono<Frame> findById(Long id);
    // this is not supported at the moment because of https://github.com/jhipster/generator-jhipster/issues/18269
    // Flux<Frame> findAllBy(Pageable pageable, Criteria criteria);

    Mono<Frame> findOneWithEagerRelationships(Long id);

    Flux<Frame> findAllWithEagerRelationships();

    Flux<Frame> findAllWithEagerRelationships(Pageable page);

    Mono<Void> deleteById(Long id);
}
