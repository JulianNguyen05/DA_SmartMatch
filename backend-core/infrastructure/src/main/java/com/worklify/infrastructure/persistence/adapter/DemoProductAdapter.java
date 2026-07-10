package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.demo.model.DemoProduct;
import com.worklify.domain.demo.repository.DemoProductRepository;
import com.worklify.infrastructure.persistence.entity.DemoProductEntity;
import com.worklify.infrastructure.persistence.repository.DemoProductJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DemoProductAdapter implements DemoProductRepository {

    private final DemoProductJpaRepository jpaRepository;

    @Override
    public DemoProduct save(DemoProduct product) {
        DemoProductEntity entity = new DemoProductEntity();
        entity.setId(product.getId()); // Nếu null thì DB tự tăng
        entity.setName(product.getName());
        entity.setPrice(product.getPrice());

        DemoProductEntity savedEntity = jpaRepository.save(entity);
        return mapToModel(savedEntity);
    }

    @Override
    public List<DemoProduct> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<DemoProduct> findById(Long id) {
        return jpaRepository.findById(id).map(this::mapToModel);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    // Helper: Map Entity -> Model
    private DemoProduct mapToModel(DemoProductEntity entity) {
        DemoProduct model = new DemoProduct();
        model.setId(entity.getId());
        model.setName(entity.getName());
        model.setPrice(entity.getPrice());
        return model;
    }
}