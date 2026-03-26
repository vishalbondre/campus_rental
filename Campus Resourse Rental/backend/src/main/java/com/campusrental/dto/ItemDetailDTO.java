package com.campusrental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ItemDetailDTO(
    Long          itemId,
    String        title,
    String        description,
    BigDecimal    dailyPrice,
    BigDecimal    securityDeposit,
    String        conditionRating,
    String        status,
    Long          categoryId,
    String        categoryName,
    Long          ownerId,
    String        ownerName,
    BigDecimal    ownerRating,
    boolean       ownerVerified,
    BigDecimal    latitude,
    BigDecimal    longitude,
    String        locationLabel,
    String        campusName,
    List<String>  imageUrls,
    List<String>  tags,
    int           viewCount,
    LocalDateTime createdAt
) {}