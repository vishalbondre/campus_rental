package com.campusrental.service;

import com.campusrental.entity.Category;
import com.campusrental.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;

    public Page<Category> getAllActive(Pageable pageable) {
        return categoryRepo.findByIsActiveTrue(pageable);
    }
}