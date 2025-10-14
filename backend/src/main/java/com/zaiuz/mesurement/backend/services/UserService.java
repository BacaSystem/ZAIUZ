package com.zaiuz.mesurement.backend.services;

import com.zaiuz.mesurement.backend.domain.User;
import com.zaiuz.mesurement.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(UUID id, User userDetails) {
        if (getUser(id).isEmpty()) return null;

        User user = getUser(id).get();
        user.setUsername(userDetails.getUsername());
        user.setPassword(userDetails.getPassword());
        user.setRole(userDetails.getRole());
        user.setUpdatedAt(OffsetDateTime.now());

        return userRepository.save(user);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUser(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUser(String username) {
        return userRepository.findByUsername(username);
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }
}
