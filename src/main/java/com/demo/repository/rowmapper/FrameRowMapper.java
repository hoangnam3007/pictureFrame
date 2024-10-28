package com.demo.repository.rowmapper;

import com.demo.domain.Frame;
import com.demo.domain.enumeration.FrameType;
import io.r2dbc.spi.Row;
import java.time.Instant;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link Frame}, with proper type conversions.
 */
@Service
public class FrameRowMapper implements BiFunction<Row, String, Frame> {

    private final ColumnConverter converter;

    public FrameRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link Frame} stored in the database.
     */
    @Override
    public Frame apply(Row row, String prefix) {
        Frame entity = new Frame();
        entity.setId(converter.fromRow(row, prefix + "_id", Long.class));
        entity.setTitle(converter.fromRow(row, prefix + "_title", String.class));
        entity.setType(converter.fromRow(row, prefix + "_type", FrameType.class));
        entity.setDescription(converter.fromRow(row, prefix + "_description", String.class));
        entity.setGuidelineUrl(converter.fromRow(row, prefix + "_guideline_url", String.class));
        entity.setImagePath(converter.fromRow(row, prefix + "_image_path", String.class));
        entity.setUsageCount(converter.fromRow(row, prefix + "_usage_count", Integer.class));
        entity.setCreatedAt(converter.fromRow(row, prefix + "_created_at", Instant.class));
        entity.setUpdatedAt(converter.fromRow(row, prefix + "_updated_at", Instant.class));
        entity.setCreatorId(converter.fromRow(row, prefix + "_creator_id", Long.class));
        return entity;
    }
}
