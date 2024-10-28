package com.demo.domain;

import static com.demo.domain.AdvertisementTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.demo.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class AdvertisementTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Advertisement.class);
        Advertisement advertisement1 = getAdvertisementSample1();
        Advertisement advertisement2 = new Advertisement();
        assertThat(advertisement1).isNotEqualTo(advertisement2);

        advertisement2.setId(advertisement1.getId());
        assertThat(advertisement1).isEqualTo(advertisement2);

        advertisement2 = getAdvertisementSample2();
        assertThat(advertisement1).isNotEqualTo(advertisement2);
    }
}
