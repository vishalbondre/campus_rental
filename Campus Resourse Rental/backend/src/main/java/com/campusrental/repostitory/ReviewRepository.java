package com.campusrental.repository;

import com.campusrental.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review>  findByReviewee_UserId(Long userId);
    Page<Review>  findByIsFlagged(boolean flagged, Pageable pageable);
    boolean existsByTransaction_TransactionIdAndReviewer_EmailIdAndReviewType(
        Long txId, String email, Review.ReviewType type);
}
