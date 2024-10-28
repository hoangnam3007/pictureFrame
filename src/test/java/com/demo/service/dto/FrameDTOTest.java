package com.demo.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.demo.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class FrameDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FrameDTO.class);
        FrameDTO frameDTO1 = new FrameDTO();
        frameDTO1.setId(1L);
        FrameDTO frameDTO2 = new FrameDTO();
        assertThat(frameDTO1).isNotEqualTo(frameDTO2);
        frameDTO2.setId(frameDTO1.getId());
        assertThat(frameDTO1).isEqualTo(frameDTO2);
        frameDTO2.setId(2L);
        assertThat(frameDTO1).isNotEqualTo(frameDTO2);
        frameDTO1.setId(null);
        assertThat(frameDTO1).isNotEqualTo(frameDTO2);
    }
}
