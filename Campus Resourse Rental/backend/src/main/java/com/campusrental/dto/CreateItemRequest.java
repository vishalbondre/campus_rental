package com.campusrental.dto;

import com.campusrental.entity.Item;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateItemRequest(
    @NotNull Long categoryId,

    @NotBlank @Size(max = 200)
    String title,

    @NotBlank
    String description,

    @NotNull @DecimalMin("0.50")
    BigDecimal dailyPrice,

    BigDecimal securityDeposit,

    Item.Condition conditionRating,

    @NotNull BigDecimal latitude,
    @NotNull BigDecimal longitude,

    String locationLabel,

    List<String> tags
) {}