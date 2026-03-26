package com.campusrental.dto;

import jakarta.validation.constraints.*;

public record ResetPasswordRequest(
    @NotBlank String token,
    @NotBlank @Size(min = 8) String newPassword
) {}