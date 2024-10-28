package com.demo.repository.rowmapper;

import com.demo.domain.Advertisement;
import io.r2dbc.spi.Row;
import java.time.Instant;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link Advertisement}, with proper type conversions.
 */
@Service
public class AdvertisementRowMapper implements BiFunction<Row, String, Advertisement> {

    private final ColumnConverter converter;

    public AdvertisementRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link Advertisement} stored in the database.
     */
    @Override
    public Advertisement apply(Row row, String prefix) {
        Advertisement entity = new Advertisement();
        entity.setId(converter.fromRow(row, prefix + "_id", Long.class));
        entity.setBrand(converter.fromRow(row, prefix + "_brand", String.class));
        entity.setImagePath(converter.fromRow(row, prefix + "_image_path", String.class));
        entity.setRedirectUrl(converter.fromRow(row, prefix + "_redirect_url", String.class));
        entity.setActive(converter.fromRow(row, prefix + "_active", Boolean.class));
        entity.setCreatedAt(converter.fromRow(row, prefix + "_created_at", Instant.class));
        entity.setUpdatedAt(converter.fromRow(row, prefix + "_updated_at", Instant.class));
        return entity;
    }
}
