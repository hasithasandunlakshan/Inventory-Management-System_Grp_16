package com.supplierservice.integration;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.supplierservice.entity.Supplier;
import com.supplierservice.repository.SupplierRepository;

@SpringBootTest
@ActiveProfiles("test")
public class SupplierRepositoryIntegrationTest {

    @Autowired
    private SupplierRepository supplierRepository;

    @Test
    public void whenSaveSupplier_thenSupplierIsPersisted() {
        // Create a test supplier
        Supplier supplier = new Supplier(
            "Test Supplier",
            "test@supplier.com",
            "1234567890",
            "123 Test Street"
        );

        // Save the supplier
        Supplier savedSupplier = supplierRepository.save(supplier);

        // Verify the supplier was saved
        assertThat(savedSupplier.getId()).isNotNull();
        assertThat(savedSupplier.getName()).isEqualTo("Test Supplier");
        assertThat(savedSupplier.getEmail()).isEqualTo("test@supplier.com");

        // Verify we can retrieve the supplier
        Supplier foundSupplier = supplierRepository.findById(savedSupplier.getId())
            .orElseThrow();

        assertThat(foundSupplier).isNotNull();
        assertThat(foundSupplier.getName()).isEqualTo(supplier.getName());
        assertThat(foundSupplier.getEmail()).isEqualTo(supplier.getEmail());
        assertThat(foundSupplier.getPhone()).isEqualTo(supplier.getPhone());
        assertThat(foundSupplier.getAddress()).isEqualTo(supplier.getAddress());
        assertThat(foundSupplier.isActive()).isTrue();
    }
}
