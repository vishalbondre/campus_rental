package com.campusrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Items",
    indexes = {
        @Index(name = "idx_items_owner",    columnList = "owner_id"),
        @Index(name = "idx_items_category", columnList = "category_id"),
        @Index(name = "idx_items_status",   columnList = "status"),
        @Index(name = "idx_items_campus",   columnList = "campus_name")
    })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "daily_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyPrice;

    @Column(name = "security_deposit", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_rating", nullable = false)
    @Builder.Default
    private Condition conditionRating = Condition.GOOD;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "location_label", length = 255)
    private String locationLabel;

    @Column(name = "campus_name", nullable = false, length = 150)
    private String campusName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.AVAILABLE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls", columnDefinition = "json")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RentalTransaction> transactions = new ArrayList<>();

    public enum Status    { AVAILABLE, RENTED, PAUSED, REMOVED }
    public enum Condition { POOR, FAIR, GOOD, EXCELLENT }
}
