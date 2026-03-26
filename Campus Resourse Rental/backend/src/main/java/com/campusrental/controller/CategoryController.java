package com.campusrental.controller;

import com.campusrental.dto.ApiResponse;
import com.campusrental.entity.Category;
import com.campusrental.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Category>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Category> cats = categoryService.getAllActive(
            PageRequest.of(page, size, Sort.by("name")));
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", cats));
    }
}