package com.campusrental.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank
    @Email(message = "Must be a valid email address")
    // @Pattern(
    //     regexp = ".*(\\.edu|\\.ac\\.in|\\.ac\\.uk)$",
    //     message = "Only campus email addresses are accepted (.edu, .ac.in, .ac.uk)"
    // )
    String emailId,

    @NotBlank
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
    String password,

    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Size(max = 150) String campusName,
    String phoneNumber
) {}