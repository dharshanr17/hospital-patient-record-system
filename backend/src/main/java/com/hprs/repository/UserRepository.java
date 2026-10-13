package com.hprs.repository;

import com.hprs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.Role role);
    List<User> findByHospital_HospitalId(Long hospitalId);
    List<User> findByRoleAndHospital_HospitalId(User.Role role, Long hospitalId);
}
