package com.campusrental.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpdateItemRequest(
    String        title,
    String        description,
    BigDecimal    dailyPrice,
    BigDecimal    securityDeposit,
    String        locationLabel,
    List<String>  tags
) {}