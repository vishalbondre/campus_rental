package com.campusrental.repository;

import com.campusrental.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailId(String emailId);
    boolean existsByEmailId(String emailId);

    @Query("SELECT u FROM User u WHERE (:verified IS NULL OR u.isVerified = :verified)")
    Page<User> findByVerifiedStatus(Boolean verified, Pageable pageable);

    long countByIsVerifiedTrue();
}
