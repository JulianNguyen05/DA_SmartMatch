package com.worklify.application.demo.service;

import com.worklify.application.demo.dto.DemoProductDto;
import com.worklify.domain.demo.model.DemoProduct;
import com.worklify.domain.demo.repository.DemoProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemoProductService {

    // Dependency Injection: Gọi Interface của tầng Domain
    private final DemoProductRepository repository;

    @Transactional
    public DemoProductDto createProduct(DemoProductDto dto) {
        DemoProduct product = new DemoProduct();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());

        DemoProduct savedProduct = repository.save(product);
        return mapToDto(savedProduct);
    }

    public List<DemoProductDto> getAllProducts() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DemoProductDto updateProduct(Long id, DemoProductDto dto) {
        DemoProduct product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());

        DemoProduct updatedProduct = repository.save(product);
        return mapToDto(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }

    // Helper: Map Model -> DTO
    private DemoProductDto mapToDto(DemoProduct product) {
        DemoProductDto dto = new DemoProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        return dto;
    }
}