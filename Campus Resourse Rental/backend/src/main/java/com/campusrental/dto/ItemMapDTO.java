package com.campusrental.dto;

import java.math.BigDecimal;

public record ItemMapDTO(
    Long       itemId,
    String     title,
    BigDecimal dailyPrice,
    double     latitude,
    double     longitude,
    String     locationLabel,
    String     categoryName,
    String     imageUrl
) {}