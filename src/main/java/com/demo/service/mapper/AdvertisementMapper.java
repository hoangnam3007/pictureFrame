package com.demo.service.mapper;

import com.demo.domain.Advertisement;
import com.demo.service.dto.AdvertisementDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Advertisement} and its DTO {@link AdvertisementDTO}.
 */
@Mapper(componentModel = "spring")
public interface AdvertisementMapper extends EntityMapper<AdvertisementDTO, Advertisement> {}
