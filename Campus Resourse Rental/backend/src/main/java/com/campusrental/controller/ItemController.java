package com.campusrental.controller;

import com.campusrental.dto.*;
import com.campusrental.entity.Item;
import com.campusrental.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    // ── Public endpoints ──────────────────────────────────────

    /** Paginated listing with filters — drives the e-commerce grid */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ItemSummaryDTO>>> listItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Item.Status status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Pageable pageable = PageRequest.of(page, size,
            Sort.by(sort.split(",")[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC, sort.split(",")[0]));
        Page<ItemSummaryDTO> items = itemService.searchItems(
            categoryId, campus, minPrice, maxPrice, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Items retrieved", items));
    }

    /** All AVAILABLE items with coordinates — powers the Leaflet map */
    @GetMapping("/map")
    public ResponseEntity<ApiResponse<List<ItemMapDTO>>> getMapItems(
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Map items retrieved",
            itemService.getMapItems(campus, categoryId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDetailDTO>> getItem(@PathVariable Long id) {
        itemService.incrementViewCount(id);
        return ResponseEntity.ok(ApiResponse.success("Item retrieved", itemService.getItemDetail(id)));
    }

    // ── Authenticated endpoints ───────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<ItemDetailDTO>> createItem(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestPart("item") CreateItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        ItemDetailDTO item = itemService.createItem(principal.getUsername(), request, images);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Item listed successfully", item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDetailDTO>> updateItem(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item updated",
            itemService.updateItem(principal.getUsername(), id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestParam Item.Status status) {
        itemService.updateStatus(principal.getUsername(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        itemService.removeItem(principal.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Item removed", null));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ItemSummaryDTO>>> getMyItems(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Your listings",
            itemService.getOwnerItems(principal.getUsername())));
    }
}

// ── Rental Transaction Controller ────────────────────────────


// ── Admin Controller ──────────────────────────────────────────
