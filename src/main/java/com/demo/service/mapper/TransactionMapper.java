package com.demo.service.mapper;

import com.demo.domain.Frame;
import com.demo.domain.Transaction;
import com.demo.domain.User;
import com.demo.service.dto.FrameDTO;
import com.demo.service.dto.TransactionDTO;
import com.demo.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Transaction} and its DTO {@link TransactionDTO}.
 */
@Mapper(componentModel = "spring")
public interface TransactionMapper extends EntityMapper<TransactionDTO, Transaction> {
    @Mapping(target = "frame", source = "frame", qualifiedByName = "frameId")
    @Mapping(target = "user", source = "user", qualifiedByName = "userLogin")
    TransactionDTO toDto(Transaction s);

    @Named("frameId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    FrameDTO toDtoFrameId(Frame frame);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);
}
