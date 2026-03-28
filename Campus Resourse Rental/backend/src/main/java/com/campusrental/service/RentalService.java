package com.campusrental.service;

import com.campusrental.dto.*;
import com.campusrental.entity.*;
import com.campusrental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalTransactionRepository txRepo;
    private final ItemRepository itemRepo;
    private final UserRepository userRepo;

    @Transactional
    public TransactionDTO requestRental(String borrowerEmail, RentalRequest req) {
        User borrower = userRepo.findByEmailId(borrowerEmail).orElseThrow();
        Item item = itemRepo.findByIdWithOwnerAndCategory(req.itemId())
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        if (item.getStatus() != Item.Status.AVAILABLE) {
            throw new IllegalStateException("Item is not available for rental");
        }

        long overlap = itemRepo.countOverlappingTransactions(
                req.itemId(), req.startDate(), req.endDate());
        if (overlap > 0) {
            throw new IllegalStateException("Item is already booked for those dates");
        }

        long days = ChronoUnit.DAYS.between(req.startDate(), req.endDate()) + 1;
        BigDecimal total = item.getDailyPrice().multiply(BigDecimal.valueOf(days));

        RentalTransaction tx = RentalTransaction.builder()
                .item(item)
                .borrower(borrower)
                .owner(item.getOwner())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .dailyPrice(item.getDailyPrice())
                .totalAmount(total)
                .securityDeposit(item.getSecurityDeposit())
                .borrowerNotes(req.borrowerNotes())
                .status(RentalTransaction.Status.PENDING)
                .build();

        return toDTO(txRepo.save(tx));
    }

    @Transactional
    public TransactionDTO respondToRequest(String ownerEmail, Long txId,
            RentalTransaction.Status action, String note) {
        RentalTransaction tx = getOwnedTransaction(ownerEmail, txId);
        if (tx.getStatus() != RentalTransaction.Status.PENDING) {
            throw new IllegalStateException("Transaction is no longer pending");
        }
        tx.setStatus(action);
        if (note != null)
            tx.setOwnerNotes(note);
        if (action == RentalTransaction.Status.APPROVED) {
            tx.getItem().setStatus(Item.Status.RENTED);
            itemRepo.save(tx.getItem());
        }
        return toDTO(txRepo.save(tx));
    }

    @Transactional
    public TransactionDTO activateRental(String ownerEmail, Long txId) {
        RentalTransaction tx = getOwnedTransaction(ownerEmail, txId);
        tx.setStatus(RentalTransaction.Status.ACTIVE);
        return toDTO(txRepo.save(tx));
    }

    @Transactional
    public TransactionDTO completeRental(String borrowerEmail, Long txId) {
        RentalTransaction tx = txRepo.findById(txId).orElseThrow();
        if (!tx.getBorrower().getEmailId().equals(borrowerEmail)) {
            throw new SecurityException("Not your transaction");
        }
        tx.setStatus(RentalTransaction.Status.COMPLETED);
        tx.getItem().setStatus(Item.Status.AVAILABLE);
        itemRepo.save(tx.getItem());
        return toDTO(txRepo.save(tx));
    }

    @Transactional
    public TransactionDTO raiseDispute(String userEmail, Long txId, String reason) {
        RentalTransaction tx = txRepo.findById(txId).orElseThrow();
        boolean isParty = tx.getBorrower().getEmailId().equals(userEmail)
                || tx.getOwner().getEmailId().equals(userEmail);
        if (!isParty)
            throw new SecurityException("Not your transaction");
        tx.setStatus(RentalTransaction.Status.DISPUTED);
        tx.setDisputeReason(reason);
        return toDTO(txRepo.save(tx));
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsAsBorrower(String email) {
        return txRepo.findByBorrower_EmailIdOrderByCreatedAtDesc(email)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsAsOwner(String email) {
        return txRepo.findByOwner_EmailIdOrderByCreatedAtDesc(email)
                .stream().map(this::toDTO).toList();
    }

    public TransactionDTO getTransaction(String email, Long txId) {
        RentalTransaction tx = txRepo.findById(txId).orElseThrow();
        boolean isParty = tx.getBorrower().getEmailId().equals(email)
                || tx.getOwner().getEmailId().equals(email);
        if (!isParty)
            throw new SecurityException("Not your transaction");
        return toDTO(tx);
    }

    private RentalTransaction getOwnedTransaction(String ownerEmail, Long txId) {
        RentalTransaction tx = txRepo.findById(txId).orElseThrow();
        if (!tx.getOwner().getEmailId().equals(ownerEmail)) {
            throw new SecurityException("Not your transaction");
        }
        return tx;
    }

    private TransactionDTO toDTO(RentalTransaction tx) {
        String imageUrl = tx.getItem().getImageUrls().isEmpty()
                ? null
                : tx.getItem().getImageUrls().get(0);
        return new TransactionDTO(
                tx.getTransactionId(),
                tx.getItem().getItemId(),
                tx.getItem().getTitle(),
                imageUrl,
                tx.getBorrower().getUserId(),
                tx.getBorrower().getFullName(),
                tx.getOwner().getUserId(),
                tx.getOwner().getFullName(),
                tx.getStartDate(),
                tx.getEndDate(),
                tx.getDailyPrice(),
                tx.getTotalAmount(),
                tx.getSecurityDeposit(),
                tx.isDepositReturned(),
                tx.getStatus().name(),
                tx.getPickupLocation(),
                tx.getBorrowerNotes(),
                tx.getOwnerNotes(),
                tx.getDisputeReason(),
                tx.isDisputeResolved(),
                tx.getCreatedAt());
    }
}