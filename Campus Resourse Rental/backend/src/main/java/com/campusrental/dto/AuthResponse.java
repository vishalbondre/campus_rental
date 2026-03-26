package com.campusrental.dto;

public record AuthResponse(String accessToken, String tokenType, UserDTO user) {
    public static AuthResponse of(String token, UserDTO user) {
        return new AuthResponse(token, "Bearer", user);
    }
}