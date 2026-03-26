package com.campusrental.dto;

import java.time.LocalDateTime;

public record ReviewDTO(
    Long          reviewId,
    Long          transactionId,
    Long          reviewerId,
    String        reviewerName,
    Long          revieweeId,
    String        revieweeName,
    Long          itemId,
    byte          rating,
    String        comment,
    String        reviewType,
    boolean       isFlagged,
    LocalDateTime createdAt
) {}
