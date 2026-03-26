package com.campusrental.dto;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record UserDTO(
    Long      userId,
    String    emailId,
    String    fullName,
    String    campusName,
    String    profileImage,
    String    role,
    boolean   isVerified,
    BigDecimal ratingAvg,
    int       ratingCount,
    LocalDateTime createdAt
) {}