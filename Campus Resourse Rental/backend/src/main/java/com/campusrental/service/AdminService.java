package com.campusrental.service;

import com.campusrental.dto.*;
import com.campusrental.entity.*;
import com.campusrental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository              userRepo;
    private final RentalTransactionRepository txRepo;
    private final ReviewRepository            reviewRepo;
    private final ItemRepository              itemRepo;

    public DashboardStatsDTO getDashboardStats() {
        return new DashboardStatsDTO(
            userRepo.count(),
            userRepo.countByIsVerifiedTrue(),
            itemRepo.count(),
            txRepo.countByStatus(RentalTransaction.Status.ACTIVE),
            txRepo.countByStatus(RentalTransaction.Status.COMPLETED),
            txRepo.countOpenDisputes()
        );
    }

    public Page<UserDTO> listUsers(Boolean verified, Pageable pageable) {
        return userRepo.findByVerifiedStatus(verified, pageable).map(this::toUserDTO);
    }

    @Transactional
    public void verifyUser(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found"));
        user.setVerified(true);
        userRepo.save(user);
    }

    public Page<TransactionDTO> listTransactions(String status, Pageable pageable) {
        return txRepo.findAllByStatus(status, pageable).map(this::toTxDTO);
    }

    public Page<TransactionDTO> listDisputes(Pageable pageable) {
        return txRepo.findOpenDisputes(pageable).map(this::toTxDTO);
    }

    @Transactional
    public void resolveDispute(Long txId, String resolution, Long resolvedByUserId) {
        RentalTransaction tx = txRepo.findById(txId).orElseThrow();
        User admin = userRepo.findById(resolvedByUserId).orElseThrow();
        tx.setDisputeResolved(true);
        tx.setDisputeResolvedBy(admin);
        tx.setOwnerNotes(resolution);
        tx.setStatus(RentalTransaction.Status.COMPLETED);
        tx.getItem().setStatus(Item.Status.AVAILABLE);
        itemRepo.save(tx.getItem());
        txRepo.save(tx);
    }

    public Page<ReviewDTO> getFlaggedReviews(Pageable pageable) {
        return reviewRepo.findByIsFlagged(true, pageable).map(this::toReviewDTO);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepo.deleteById(reviewId);
    }

    private UserDTO toUserDTO(User u) {
        return UserDTO.builder()
            .userId(u.getUserId())
            .emailId(u.getEmailId())
            .fullName(u.getFullName())
            .campusName(u.getCampusName())
            .profileImage(u.getProfileImage())
            .role(u.getRole().name())
            .isVerified(u.isVerified())
            .ratingAvg(u.getRatingAvg())
            .ratingCount(u.getRatingCount())
            .createdAt(u.getCreatedAt())
            .build();
    }

    private TransactionDTO toTxDTO(RentalTransaction tx) {
        String img = tx.getItem().getImageUrls().isEmpty()
            ? null : tx.getItem().getImageUrls().get(0);
        return new TransactionDTO(
            tx.getTransactionId(),
            tx.getItem().getItemId(),
            tx.getItem().getTitle(),
            img,
            tx.getBorrower().getUserId(),
            tx.getBorrower().getFullName(),
            tx.getOwner().getUserId(),
            tx.getOwner().getFullName(),
            tx.getStartDate(), tx.getEndDate(),
            tx.getDailyPrice(), tx.getTotalAmount(),
            tx.getSecurityDeposit(), tx.isDepositReturned(),
            tx.getStatus().name(), tx.getPickupLocation(),
            tx.getBorrowerNotes(), tx.getOwnerNotes(),
            tx.getDisputeReason(), tx.isDisputeResolved(),
            tx.getCreatedAt()
        );
    }

    private ReviewDTO toReviewDTO(Review r) {
        return new ReviewDTO(
            r.getReviewId(),
            r.getTransaction().getTransactionId(),
            r.getReviewer().getUserId(),
            r.getReviewer().getFullName(),
            r.getReviewee().getUserId(),
            r.getReviewee().getFullName(),
            r.getItem().getItemId(),
            r.getRating(),
            r.getComment(),
            r.getReviewType().name(),
            r.isFlagged(),
            r.getCreatedAt()
        );
    }
}