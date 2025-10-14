package com.zaiuz.mesurement.backend.controllers;

import com.zaiuz.mesurement.backend.domain.User;
import com.zaiuz.mesurement.backend.domain.dto.UserDto;
import com.zaiuz.mesurement.backend.services.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final ModelMapper modelMapper;

    public UserController(UserService userService) {
        this.userService = userService;
        this.modelMapper = new ModelMapper();
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        Optional<User> foundUser = userService.getUser(id);
        return foundUser.map(user -> {
            UserDto userDto = modelMapper.map(user, UserDto.class);
            return new ResponseEntity<>(userDto, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping(path = "/user/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable UUID id, @RequestBody UserDto userDto) {
        if(userService.getUser(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        User userDetails = modelMapper.map(userDto, User.class);
        User user = userService.updateUser(id, userDetails);
        return new ResponseEntity<>(modelMapper.map(user, UserDto.class), HttpStatus.OK);
    }

    @DeleteMapping(path = "/user/{id}")
    public ResponseEntity deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }
}
