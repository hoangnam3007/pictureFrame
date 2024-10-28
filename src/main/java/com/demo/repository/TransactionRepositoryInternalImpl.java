package com.demo.repository;

import com.demo.domain.Transaction;
import com.demo.repository.rowmapper.FrameRowMapper;
import com.demo.repository.rowmapper.TransactionRowMapper;
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
 * Spring Data R2DBC custom repository implementation for the Transaction entity.
 */
@SuppressWarnings("unused")
class TransactionRepositoryInternalImpl extends SimpleR2dbcRepository<Transaction, Long> implements TransactionRepositoryInternal {

    private final DatabaseClient db;
    private final R2dbcEntityTemplate r2dbcEntityTemplate;
    private final EntityManager entityManager;

    private final FrameRowMapper frameMapper;
    private final UserRowMapper userMapper;
    private final TransactionRowMapper transactionMapper;

    private static final Table entityTable = Table.aliased("transaction", EntityManager.ENTITY_ALIAS);
    private static final Table frameTable = Table.aliased("frame", "frame");
    private static final Table userTable = Table.aliased("jhi_user", "e_user");

    public TransactionRepositoryInternalImpl(
        R2dbcEntityTemplate template,
        EntityManager entityManager,
        FrameRowMapper frameMapper,
        UserRowMapper userMapper,
        TransactionRowMapper transactionMapper,
        R2dbcEntityOperations entityOperations,
        R2dbcConverter converter
    ) {
        super(
            new MappingRelationalEntityInformation(converter.getMappingContext().getRequiredPersistentEntity(Transaction.class)),
            entityOperations,
            converter
        );
        this.db = template.getDatabaseClient();
        this.r2dbcEntityTemplate = template;
        this.entityManager = entityManager;
        this.frameMapper = frameMapper;
        this.userMapper = userMapper;
        this.transactionMapper = transactionMapper;
    }

    @Override
    public Flux<Transaction> findAllBy(Pageable pageable) {
        return createQuery(pageable, null).all();
    }

    RowsFetchSpec<Transaction> createQuery(Pageable pageable, Condition whereClause) {
        List<Expression> columns = TransactionSqlHelper.getColumns(entityTable, EntityManager.ENTITY_ALIAS);
        columns.addAll(FrameSqlHelper.getColumns(frameTable, "frame"));
        columns.addAll(UserSqlHelper.getColumns(userTable, "user"));
        SelectFromAndJoinCondition selectFrom = Select.builder()
            .select(columns)
            .from(entityTable)
            .leftOuterJoin(frameTable)
            .on(Column.create("frame_id", entityTable))
            .equals(Column.create("id", frameTable))
            .leftOuterJoin(userTable)
            .on(Column.create("user_id", entityTable))
            .equals(Column.create("id", userTable));
        // we do not support Criteria here for now as of https://github.com/jhipster/generator-jhipster/issues/18269
        String select = entityManager.createSelect(selectFrom, Transaction.class, pageable, whereClause);
        return db.sql(select).map(this::process);
    }

    @Override
    public Flux<Transaction> findAll() {
        return findAllBy(null);
    }

    @Override
    public Mono<Transaction> findById(Long id) {
        Comparison whereClause = Conditions.isEqual(entityTable.column("id"), Conditions.just(id.toString()));
        return createQuery(null, whereClause).one();
    }

    @Override
    public Mono<Transaction> findOneWithEagerRelationships(Long id) {
        return findById(id);
    }

    @Override
    public Flux<Transaction> findAllWithEagerRelationships() {
        return findAll();
    }

    @Override
    public Flux<Transaction> findAllWithEagerRelationships(Pageable page) {
        return findAllBy(page);
    }

    private Transaction process(Row row, RowMetadata metadata) {
        Transaction entity = transactionMapper.apply(row, "e");
        entity.setFrame(frameMapper.apply(row, "frame"));
        entity.setUser(userMapper.apply(row, "user"));
        return entity;
    }

    @Override
    public <S extends Transaction> Mono<S> save(S entity) {
        return super.save(entity);
    }
}
