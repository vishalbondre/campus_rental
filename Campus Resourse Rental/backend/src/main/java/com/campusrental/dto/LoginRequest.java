package com.campusrental.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank @Email String emailId,
    @NotBlank         String password
) {}