package com.demo.repository;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.relational.core.sql.Column;
import org.springframework.data.relational.core.sql.Expression;
import org.springframework.data.relational.core.sql.Table;

public class AdvertisementSqlHelper {

    public static List<Expression> getColumns(Table table, String columnPrefix) {
        List<Expression> columns = new ArrayList<>();
        columns.add(Column.aliased("id", table, columnPrefix + "_id"));
        columns.add(Column.aliased("brand", table, columnPrefix + "_brand"));
        columns.add(Column.aliased("image_path", table, columnPrefix + "_image_path"));
        columns.add(Column.aliased("redirect_url", table, columnPrefix + "_redirect_url"));
        columns.add(Column.aliased("active", table, columnPrefix + "_active"));
        columns.add(Column.aliased("created_at", table, columnPrefix + "_created_at"));
        columns.add(Column.aliased("updated_at", table, columnPrefix + "_updated_at"));

        return columns;
    }
}
