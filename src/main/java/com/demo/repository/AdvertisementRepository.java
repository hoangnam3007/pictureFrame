package com.demo.repository;

import com.demo.domain.Advertisement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the Advertisement entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AdvertisementRepository extends ReactiveCrudRepository<Advertisement, Long>, AdvertisementRepositoryInternal {
    Flux<Advertisement> findAllBy(Pageable pageable);

    @Override
    <S extends Advertisement> Mono<S> save(S entity);

    @Override
    Flux<Advertisement> findAll();

    @Override
    Mono<Advertisement> findById(Long id);

    @Override
    Mono<Void> deleteById(Long id);
}

interface AdvertisementRepositoryInternal {
    <S extends Advertisement> Mono<S> save(S entity);

    Flux<Advertisement> findAllBy(Pageable pageable);

    Flux<Advertisement> findAll();

    Mono<Advertisement> findById(Long id);
    // this is not supported at the moment because of https://github.com/jhipster/generator-jhipster/issues/18269
    // Flux<Advertisement> findAllBy(Pageable pageable, Criteria criteria);
}
