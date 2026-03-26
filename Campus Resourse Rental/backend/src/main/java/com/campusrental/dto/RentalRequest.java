package com.campusrental.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RentalRequest(
    @NotNull Long      itemId,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    String             borrowerNotes
) {}