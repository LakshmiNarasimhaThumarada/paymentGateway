package com.paysecure.config;

import com.paysecure.entity.Role;
import com.paysecure.entity.User;
import com.paysecure.repository.RoleRepository;
import com.paysecure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed default roles
        Role adminRole = seedRole("ADMIN");
        Role engineerRole = seedRole("PLATFORM_ENGINEER");
        Role auditorRole = seedRole("AUDITOR");

        // Seed default test accounts if they don't exist
        seedUser("admin@paysecure.com", "Admin", "User", "Password123", adminRole);
        seedUser("engineer@paysecure.com", "Platform", "Engineer", "Password123", engineerRole);
        seedUser("auditor@paysecure.com", "Compliance", "Auditor", "Password123", auditorRole);
    }

    private Role seedRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).build()));
    }

    private void seedUser(String email, String firstName, String lastName, String plainPassword, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password(passwordEncoder.encode(plainPassword))
                    .role(role)
                    .build();
            userRepository.save(user);
        }
    }
}
