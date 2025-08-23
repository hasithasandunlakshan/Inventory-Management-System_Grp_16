package com.supplierservice.supplierservice.repository.ml;

import com.supplierservice.supplierservice.models.ml.PoFeaturesAtCreation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PoFeaturesAtCreationRepository extends JpaRepository<PoFeaturesAtCreation, Long> {
    Optional<PoFeaturesAtCreation> findByPoId(Long poId);
}
