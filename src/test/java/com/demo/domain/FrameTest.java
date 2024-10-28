package com.demo.domain;

import static com.demo.domain.FrameTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.demo.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class FrameTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Frame.class);
        Frame frame1 = getFrameSample1();
        Frame frame2 = new Frame();
        assertThat(frame1).isNotEqualTo(frame2);

        frame2.setId(frame1.getId());
        assertThat(frame1).isEqualTo(frame2);

        frame2 = getFrameSample2();
        assertThat(frame1).isNotEqualTo(frame2);
    }
}
