package com.smartmatch.api.controller.admin;

import com.smartmatch.application.dto.admin.ToggleStatusRequest;
import com.smartmatch.application.dto.admin.UserAdminResponse;
import com.smartmatch.application.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id, @RequestBody ToggleStatusRequest request) {
        adminUserService.toggleUserStatus(id, request.isEnabled());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}