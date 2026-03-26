package com.campusrental.repository;

import com.campusrental.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    // ── Dynamic search for the grid view ─────────────────────
    @Query("""
        SELECT i FROM Item i
        JOIN FETCH i.owner o
        JOIN FETCH i.category c
        WHERE i.status = 'AVAILABLE'
          AND (:categoryId IS NULL OR c.categoryId = :categoryId)
          AND (:campus    IS NULL OR i.campusName LIKE %:campus%)
          AND (:minPrice  IS NULL OR i.dailyPrice >= :minPrice)
          AND (:maxPrice  IS NULL OR i.dailyPrice <= :maxPrice)
          AND (:search    IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%',:search,'%'))
                                  OR LOWER(i.description) LIKE LOWER(CONCAT('%',:search,'%')))
        """)
    Page<Item> searchAvailable(
        @Param("categoryId") Long categoryId,
        @Param("campus")     String campus,
        @Param("minPrice")   BigDecimal minPrice,
        @Param("maxPrice")   BigDecimal maxPrice,
        @Param("search")     String search,
        Pageable pageable);

    // ── Map view — lightweight, only coords + meta ────────────
    @Query("""
        SELECT i FROM Item i
        JOIN FETCH i.category c
        WHERE i.status = 'AVAILABLE'
          AND (:campus     IS NULL OR i.campusName LIKE %:campus%)
          AND (:categoryId IS NULL OR c.categoryId = :categoryId)
        """)
    List<Item> findForMap(@Param("campus") String campus,
                          @Param("categoryId") Long categoryId);

    List<Item> findByOwner_EmailIdOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("UPDATE Item i SET i.viewCount = i.viewCount + 1 WHERE i.itemId = :id")
    void incrementViewCount(@Param("id") Long id);

    // ── Availability check (prevent double-booking) ───────────
    @Query("""
        SELECT COUNT(t) FROM RentalTransaction t
        WHERE t.item.itemId = :itemId
          AND t.status IN ('APPROVED','ACTIVE')
          AND NOT (t.endDate < :startDate OR t.startDate > :endDate)
        """)
    long countOverlappingTransactions(
        @Param("itemId")    Long itemId,
        @Param("startDate") java.time.LocalDate startDate,
        @Param("endDate")   java.time.LocalDate endDate);
}
