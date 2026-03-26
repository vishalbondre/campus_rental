package com.campusrental.repository;

import com.campusrental.entity.Category;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Page<Category> findByIsActiveTrue(Pageable pageable);
}