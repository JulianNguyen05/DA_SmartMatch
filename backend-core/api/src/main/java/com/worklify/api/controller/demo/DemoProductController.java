package com.worklify.api.controller.demo;

import com.worklify.application.demo.dto.DemoProductDto;
import com.worklify.application.demo.service.DemoProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/demos/products")
@RequiredArgsConstructor
@Tag(name = "Demo API", description = "API dùng để demo")
public class DemoProductController {

    private final DemoProductService demoProductService;

    @PostMapping
    @Operation(summary = "1. CREATE - Tạo mới một sản phẩm Demo")
    public ResponseEntity<DemoProductDto> createProduct(@RequestBody DemoProductDto dto) {
        return ResponseEntity.ok(demoProductService.createProduct(dto));
    }

    @GetMapping
    @Operation(summary = "2. READ - Lấy danh sách tất cả sản phẩm")
    public ResponseEntity<List<DemoProductDto>> getAllProducts() {
        return ResponseEntity.ok(demoProductService.getAllProducts());
    }

    @PutMapping("/{id}")
    @Operation(summary = "3. UPDATE - Cập nhật tên/giá sản phẩm")
    public ResponseEntity<DemoProductDto> updateProduct(@PathVariable("id") Long id, @RequestBody DemoProductDto dto) {
        return ResponseEntity.ok(demoProductService.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "4. DELETE - Xóa sản phẩm")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        demoProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}