package com.zaiuz.mesurement.backend.security;

import com.zaiuz.mesurement.backend.domain.User;
import com.zaiuz.mesurement.backend.repositories.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
public class SystemUserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    public SystemUserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            return new UserDetails() {
                @Override
                public Collection<? extends GrantedAuthority> getAuthorities() {
                    return java.util.List.of(new SimpleGrantedAuthority(user.get().getRole()));
                }

                @Override
                public String getPassword() {
                    return user.get().getPassword();
                }

                @Override
                public String getUsername() {
                    return user.get().getUsername();
                }
            };
        }
        else {
            throw new UsernameNotFoundException(username);
        }
    }
}
