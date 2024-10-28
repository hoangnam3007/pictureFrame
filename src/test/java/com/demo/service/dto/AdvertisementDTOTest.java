package com.demo.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.demo.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class AdvertisementDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AdvertisementDTO.class);
        AdvertisementDTO advertisementDTO1 = new AdvertisementDTO();
        advertisementDTO1.setId(1L);
        AdvertisementDTO advertisementDTO2 = new AdvertisementDTO();
        assertThat(advertisementDTO1).isNotEqualTo(advertisementDTO2);
        advertisementDTO2.setId(advertisementDTO1.getId());
        assertThat(advertisementDTO1).isEqualTo(advertisementDTO2);
        advertisementDTO2.setId(2L);
        assertThat(advertisementDTO1).isNotEqualTo(advertisementDTO2);
        advertisementDTO1.setId(null);
        assertThat(advertisementDTO1).isNotEqualTo(advertisementDTO2);
    }
}
