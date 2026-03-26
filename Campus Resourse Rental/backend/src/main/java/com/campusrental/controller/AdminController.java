package com.campusrental.controller;

import com.campusrental.dto.*;
import com.campusrental.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard data", adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> listUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean verified) {
        return ResponseEntity.ok(ApiResponse.success("Users",
            adminService.listUsers(verified, PageRequest.of(page, size))));
    }

    @PatchMapping("/users/{id}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyUser(@PathVariable Long id) {
        adminService.verifyUser(id);
        return ResponseEntity.ok(ApiResponse.success("User verified", null));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<TransactionDTO>>> listTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Transactions",
            adminService.listTransactions(status, PageRequest.of(page, size))));
    }

    @GetMapping("/disputes")
    public ResponseEntity<ApiResponse<Page<TransactionDTO>>> listDisputes(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Disputes",
            adminService.listDisputes(PageRequest.of(page, size))));
    }

    @PatchMapping("/disputes/{transactionId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveDispute(
            @PathVariable Long transactionId,
            @RequestParam String resolution,
            @RequestParam Long resolvedByUserId) {
        adminService.resolveDispute(transactionId, resolution, resolvedByUserId);
        return ResponseEntity.ok(ApiResponse.success("Dispute resolved", null));
    }

    @GetMapping("/reviews/flagged")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> flaggedReviews(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Flagged reviews",
            adminService.getFlaggedReviews(PageRequest.of(page, size))));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review removed", null));
    }
}
