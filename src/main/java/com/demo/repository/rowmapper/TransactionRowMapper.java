package com.demo.repository.rowmapper;

import com.demo.domain.Transaction;
import io.r2dbc.spi.Row;
import java.time.Instant;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link Transaction}, with proper type conversions.
 */
@Service
public class TransactionRowMapper implements BiFunction<Row, String, Transaction> {

    private final ColumnConverter converter;

    public TransactionRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link Transaction} stored in the database.
     */
    @Override
    public Transaction apply(Row row, String prefix) {
        Transaction entity = new Transaction();
        entity.setId(converter.fromRow(row, prefix + "_id", Long.class));
        entity.setUsedAt(converter.fromRow(row, prefix + "_used_at", Instant.class));
        entity.setFrameId(converter.fromRow(row, prefix + "_frame_id", Long.class));
        entity.setUserId(converter.fromRow(row, prefix + "_user_id", Long.class));
        return entity;
    }
}
