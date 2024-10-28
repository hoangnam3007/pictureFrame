package com.demo.service.mapper;

import static com.demo.domain.AdvertisementAsserts.*;
import static com.demo.domain.AdvertisementTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AdvertisementMapperTest {

    private AdvertisementMapper advertisementMapper;

    @BeforeEach
    void setUp() {
        advertisementMapper = new AdvertisementMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAdvertisementSample1();
        var actual = advertisementMapper.toEntity(advertisementMapper.toDto(expected));
        assertAdvertisementAllPropertiesEquals(expected, actual);
    }
}
