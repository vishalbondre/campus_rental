package com.campusrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Rental_Transactions",
    indexes = {
        @Index(name = "idx_rt_item",     columnList = "item_id"),
        @Index(name = "idx_rt_borrower", columnList = "borrower_id"),
        @Index(name = "idx_rt_owner",    columnList = "owner_id"),
        @Index(name = "idx_rt_status",   columnList = "status")
    })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RentalTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "daily_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyPrice;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "security_deposit", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Column(name = "deposit_returned", nullable = false)
    @Builder.Default
    private boolean depositReturned = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "pickup_location", length = 255)
    private String pickupLocation;

    @Column(name = "return_location", length = 255)
    private String returnLocation;

    @Column(name = "borrower_notes", columnDefinition = "TEXT")
    private String borrowerNotes;

    @Column(name = "owner_notes", columnDefinition = "TEXT")
    private String ownerNotes;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "dispute_resolved", nullable = false)
    @Builder.Default
    private boolean disputeResolved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_resolved_by")
    private User disputeResolvedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;

    public enum Status {
        PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED, DISPUTED
    }
}
