package com.campusrental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionDTO(
    Long          transactionId,
    Long          itemId,
    String        itemTitle,
    String        itemImage,
    Long          borrowerId,
    String        borrowerName,
    Long          ownerId,
    String        ownerName,
    LocalDate     startDate,
    LocalDate     endDate,
    BigDecimal    dailyPrice,
    BigDecimal    totalAmount,
    BigDecimal    securityDeposit,
    boolean       depositReturned,
    String        status,
    String        pickupLocation,
    String        borrowerNotes,
    String        ownerNotes,
    String        disputeReason,
    boolean       disputeResolved,
    LocalDateTime createdAt
) {}