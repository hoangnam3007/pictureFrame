package com.demo.repository;

import com.demo.domain.Frame;
import com.demo.repository.rowmapper.FrameRowMapper;
import com.demo.repository.rowmapper.UserRowMapper;
import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.convert.R2dbcConverter;
import org.springframework.data.r2dbc.core.R2dbcEntityOperations;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.r2dbc.repository.support.SimpleR2dbcRepository;
import org.springframework.data.relational.core.sql.Column;
import org.springframework.data.relational.core.sql.Comparison;
import org.springframework.data.relational.core.sql.Condition;
import org.springframework.data.relational.core.sql.Conditions;
import org.springframework.data.relational.core.sql.Expression;
import org.springframework.data.relational.core.sql.Select;
import org.springframework.data.relational.core.sql.SelectBuilder.SelectFromAndJoinCondition;
import org.springframework.data.relational.core.sql.Table;
import org.springframework.data.relational.repository.support.MappingRelationalEntityInformation;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.r2dbc.core.RowsFetchSpec;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC custom repository implementation for the Frame entity.
 */
@SuppressWarnings("unused")
class FrameRepositoryInternalImpl extends SimpleR2dbcRepository<Frame, Long> implements FrameRepositoryInternal {

    private final DatabaseClient db;
    private final R2dbcEntityTemplate r2dbcEntityTemplate;
    private final EntityManager entityManager;

    private final UserRowMapper userMapper;
    private final FrameRowMapper frameMapper;

    private static final Table entityTable = Table.aliased("frame", EntityManager.ENTITY_ALIAS);
    private static final Table creatorTable = Table.aliased("jhi_user", "creator");

    public FrameRepositoryInternalImpl(
        R2dbcEntityTemplate template,
        EntityManager entityManager,
        UserRowMapper userMapper,
        FrameRowMapper frameMapper,
        R2dbcEntityOperations entityOperations,
        R2dbcConverter converter
    ) {
        super(
            new MappingRelationalEntityInformation(converter.getMappingContext().getRequiredPersistentEntity(Frame.class)),
            entityOperations,
            converter
        );
        this.db = template.getDatabaseClient();
        this.r2dbcEntityTemplate = template;
        this.entityManager = entityManager;
        this.userMapper = userMapper;
        this.frameMapper = frameMapper;
    }

    @Override
    public Flux<Frame> findAllBy(Pageable pageable) {
        return createQuery(pageable, null).all();
    }

    RowsFetchSpec<Frame> createQuery(Pageable pageable, Condition whereClause) {
        List<Expression> columns = FrameSqlHelper.getColumns(entityTable, EntityManager.ENTITY_ALIAS);
        columns.addAll(UserSqlHelper.getColumns(creatorTable, "creator"));
        SelectFromAndJoinCondition selectFrom = Select.builder()
            .select(columns)
            .from(entityTable)
            .leftOuterJoin(creatorTable)
            .on(Column.create("creator_id", entityTable))
            .equals(Column.create("id", creatorTable));
        // we do not support Criteria here for now as of https://github.com/jhipster/generator-jhipster/issues/18269
        String select = entityManager.createSelect(selectFrom, Frame.class, pageable, whereClause);
        return db.sql(select).map(this::process);
    }

    @Override
    public Flux<Frame> findAll() {
        return findAllBy(null);
    }

    @Override
    public Mono<Frame> findById(Long id) {
        Comparison whereClause = Conditions.isEqual(entityTable.column("id"), Conditions.just(id.toString()));
        return createQuery(null, whereClause).one();
    }

    @Override
    public Mono<Frame> findOneWithEagerRelationships(Long id) {
        return findById(id);
    }

    @Override
    public Flux<Frame> findAllWithEagerRelationships() {
        return findAll();
    }

    @Override
    public Flux<Frame> findAllWithEagerRelationships(Pageable page) {
        return findAllBy(page);
    }

    private Frame process(Row row, RowMetadata metadata) {
        Frame entity = frameMapper.apply(row, "e");
        entity.setCreator(userMapper.apply(row, "creator"));
        return entity;
    }

    @Override
    public <S extends Frame> Mono<S> save(S entity) {
        return super.save(entity);
    }

    @Override
    public Mono<Frame> findByGuidelineUrl(String url) {
        Comparison whereClause = Conditions.isEqual(entityTable.column("guideline_url"), Conditions.just(url));
        return createQuery(null, whereClause).one();
    }

    @Override
    public Mono<Boolean> existsByGuidelineUrl(String url) {
        // Build the condition for guideline_url
        Comparison whereClause = Conditions.isEqual(entityTable.column("guideline_url"), Conditions.just("'" + url + "'"));

        // Use createQuery to check existence
        return createQuery(null, whereClause)
            .one() // Fetch one result
            .hasElement(); // Check if an element exists
    }
}
