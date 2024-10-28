package com.demo.service.mapper;

import static com.demo.domain.FrameAsserts.*;
import static com.demo.domain.FrameTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FrameMapperTest {

    private FrameMapper frameMapper;

    @BeforeEach
    void setUp() {
        frameMapper = new FrameMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getFrameSample1();
        var actual = frameMapper.toEntity(frameMapper.toDto(expected));
        assertFrameAllPropertiesEquals(expected, actual);
    }
}
