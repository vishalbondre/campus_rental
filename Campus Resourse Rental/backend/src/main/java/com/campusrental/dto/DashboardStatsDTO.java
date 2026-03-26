package com.campusrental.dto;

public record DashboardStatsDTO(
    long totalUsers,
    long verifiedUsers,
    long totalItems,
    long activeTransactions,
    long completedRentals,
    long openDisputes
) {}