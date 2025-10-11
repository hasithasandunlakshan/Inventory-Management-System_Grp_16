package com.supplierservice.supplierservice.test.integration;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
public class TestSupplierIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private TestSupplierRepository testSupplierRepository;

    @Test
    void whenSaveTestSupplier_thenSupplierIsPersisted() {
        // Create a test supplier
        TestSupplier supplier = new TestSupplier(
                "Test Supplier",
                "test@supplier.com",
                "1234567890");

        // Save the supplier
        TestSupplier savedSupplier = testSupplierRepository.save(supplier);

        // Verify the supplier was saved with an ID
        assertThat(savedSupplier.getId()).isNotNull();

        // Retrieve the supplier and verify its properties
        TestSupplier foundSupplier = testSupplierRepository.findById(savedSupplier.getId())
                .orElseThrow();

        assertThat(foundSupplier).isNotNull();
        assertThat(foundSupplier.getName()).isEqualTo("Test Supplier");
        assertThat(foundSupplier.getEmail()).isEqualTo("test@supplier.com");
        assertThat(foundSupplier.getPhone()).isEqualTo("1234567890");
    }
}
