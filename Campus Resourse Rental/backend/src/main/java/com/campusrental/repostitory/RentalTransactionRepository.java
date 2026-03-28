package com.campusrental.repository;

import com.campusrental.entity.RentalTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalTransactionRepository extends JpaRepository<RentalTransaction, Long> {

    // @Query("""
    // SELECT t FROM RentalTransaction t
    // JOIN FETCH t.item i
    // JOIN FETCH i.owner
    // JOIN FETCH t.borrower
    // JOIN FETCH t.owner
    // WHERE t.borrower.emailId = :email
    // ORDER BY t.createdAt DESC
    // """)
    List<RentalTransaction> findByBorrower_EmailIdOrderByCreatedAtDesc(
            @Param("email") String email);

    // @Query("""
    // SELECT t FROM RentalTransaction t
    // JOIN FETCH t.item i
    // JOIN FETCH i.owner
    // JOIN FETCH t.borrower
    // JOIN FETCH t.owner
    // WHERE t.owner.emailId = :email
    // ORDER BY t.createdAt DESC
    // """)
    List<RentalTransaction> findByOwner_EmailIdOrderByCreatedAtDesc(
            @Param("email") String email);

    @Query("SELECT t FROM RentalTransaction t WHERE t.status = 'DISPUTED' AND t.disputeResolved = false")
    Page<RentalTransaction> findOpenDisputes(Pageable pageable);

    @Query("""
            SELECT t FROM RentalTransaction t
            WHERE (:status IS NULL OR CAST(t.status AS string) = :status)
            ORDER BY t.createdAt DESC
            """)
    Page<RentalTransaction> findAllByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT COUNT(t) FROM RentalTransaction t WHERE t.status = :status")
    long countByStatus(@Param("status") RentalTransaction.Status status);

    @Query("SELECT COUNT(t) FROM RentalTransaction t " +
            "WHERE t.status = 'DISPUTED' AND t.disputeResolved = false")
    long countOpenDisputes();
}
