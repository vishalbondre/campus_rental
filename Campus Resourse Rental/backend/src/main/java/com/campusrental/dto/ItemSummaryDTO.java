package com.campusrental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ItemSummaryDTO(
    Long          itemId,
    String        title,
    BigDecimal    dailyPrice,
    BigDecimal    securityDeposit,
    String        conditionRating,
    String        status,
    String        categoryName,
    String        categoryIcon,
    String        ownerName,
    BigDecimal    ownerRating,
    String        locationLabel,
    String        campusName,
    String        imageUrl,
    LocalDateTime createdAt
) {}