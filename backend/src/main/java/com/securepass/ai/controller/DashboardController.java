package com.securepass.ai.controller;

import com.securepass.ai.dto.DashboardMetricsResponse;
import com.securepass.ai.entity.User;
import com.securepass.ai.service.DashboardService;
import com.securepass.ai.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    public DashboardController(DashboardService dashboardService, UserService userService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        User user = getAuthenticatedUser();
        DashboardMetricsResponse response = dashboardService.getDashboardMetrics(user.getId());
        return ResponseEntity.ok(response);
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }
}
