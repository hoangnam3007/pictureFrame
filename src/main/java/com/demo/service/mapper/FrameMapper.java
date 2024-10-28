package com.demo.service.mapper;

import com.demo.domain.Frame;
import com.demo.domain.User;
import com.demo.service.dto.FrameDTO;
import com.demo.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Frame} and its DTO {@link FrameDTO}.
 */
@Mapper(componentModel = "spring")
public interface FrameMapper extends EntityMapper<FrameDTO, Frame> {
    @Mapping(target = "creator", source = "creator", qualifiedByName = "userLogin")
    FrameDTO toDto(Frame s);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);
}
