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

    public User create(User user) {
        return userRepository.save(user);
    }

    public User update(UUID id, User userDetails) {
        if (get(id).isEmpty()) return null;

        User user = get(id).get();
        user.setUsername(userDetails.getUsername());
        user.setPassword(userDetails.getPassword());
        user.setRole(userDetails.getRole());
        user.setUpdatedAt(OffsetDateTime.now());

        return userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> get(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> get(String username) {
        return userRepository.findByUsername(username);
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }
}
