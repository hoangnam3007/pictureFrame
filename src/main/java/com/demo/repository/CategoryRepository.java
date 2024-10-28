package com.demo.repository;

import com.demo.domain.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the Category entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CategoryRepository extends ReactiveCrudRepository<Category, Long>, CategoryRepositoryInternal {
    Flux<Category> findAllBy(Pageable pageable);

    @Override
    <S extends Category> Mono<S> save(S entity);

    @Override
    Flux<Category> findAll();

    @Override
    Mono<Category> findById(Long id);

    @Override
    Mono<Void> deleteById(Long id);
}

interface CategoryRepositoryInternal {
    <S extends Category> Mono<S> save(S entity);

    Flux<Category> findAllBy(Pageable pageable);

    Flux<Category> findAll();

    Mono<Category> findById(Long id);
    // this is not supported at the moment because of https://github.com/jhipster/generator-jhipster/issues/18269
    // Flux<Category> findAllBy(Pageable pageable, Criteria criteria);
}
