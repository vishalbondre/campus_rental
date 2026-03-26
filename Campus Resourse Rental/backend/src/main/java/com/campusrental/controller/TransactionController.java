package com.campusrental.controller;

import com.campusrental.dto.*;
import com.campusrental.entity.RentalTransaction;
import com.campusrental.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final RentalService rentalService;

    /** Borrower submits a rental request */
    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDTO>> requestRental(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody RentalRequest request) {
        TransactionDTO tx = rentalService.requestRental(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Rental request submitted", tx));
    }

    /** Owner approves / rejects */
    @PatchMapping("/{id}/respond")
    public ResponseEntity<ApiResponse<TransactionDTO>> respondToRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestParam RentalTransaction.Status action,
            @RequestParam(required = false) String ownerNote) {
        return ResponseEntity.ok(ApiResponse.success("Response recorded",
            rentalService.respondToRequest(principal.getUsername(), id, action, ownerNote)));
    }

    /** Mark item as picked up → ACTIVE */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<TransactionDTO>> activateRental(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Rental activated",
            rentalService.activateRental(principal.getUsername(), id)));
    }

    /** Mark rental as returned → COMPLETED */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TransactionDTO>> completeRental(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Rental completed",
            rentalService.completeRental(principal.getUsername(), id)));
    }

    /** Raise a dispute */
    @PatchMapping("/{id}/dispute")
    public ResponseEntity<ApiResponse<TransactionDTO>> raiseDispute(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success("Dispute raised",
            rentalService.raiseDispute(principal.getUsername(), id, reason)));
    }

    @GetMapping("/as-borrower")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> myBorrowals(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Your rentals",
            rentalService.getTransactionsAsBorrower(principal.getUsername())));
    }

    @GetMapping("/as-owner")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> myLendings(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Your lendings",
            rentalService.getTransactionsAsOwner(principal.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDTO>> getTransaction(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Transaction details",
            rentalService.getTransaction(principal.getUsername(), id)));
    }
}