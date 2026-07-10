package com.worklify.domain.demo.repository;

import com.worklify.domain.demo.model.DemoProduct;
import java.util.List;
import java.util.Optional;

public interface DemoProductRepository {
    DemoProduct save(DemoProduct product);
    List<DemoProduct> findAll();
    Optional<DemoProduct> findById(Long id);
    void deleteById(Long id);
}