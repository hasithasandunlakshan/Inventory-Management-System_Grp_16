package com.supplierservice.supplierservice.test.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.supplierservice.supplierservice.test.integration.TestSupplier;
import com.supplierservice.supplierservice.test.integration.TestSupplierRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@ActiveProfiles({ "test", "mysql-test" })
@Testcontainers
public class DatabaseIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TestSupplierRepository testSupplierRepository;

    @Test
    void whenSaveTestSupplier_thenSupplierIsPersisted() {
        // Create a test supplier
        TestSupplier supplier = TestSupplier.builder()
                .name("Test Supplier DB")
                .email("test@supplier.com")
                .phone("1234567890")
                .build();

        // Save using repository
        TestSupplier savedSupplier = testSupplierRepository.save(supplier);

        // Flush to ensure it's written to database
        entityManager.flush();
        entityManager.clear();

        // Verify the supplier was saved with an ID
        assertThat(savedSupplier.getId()).isNotNull();
        assertThat(savedSupplier.getName()).isEqualTo("Test Supplier DB");
        assertThat(savedSupplier.getEmail()).isEqualTo("test@supplier.com");
        assertThat(savedSupplier.getPhone()).isEqualTo("1234567890");

        // Retrieve and verify
        TestSupplier foundSupplier = testSupplierRepository.findById(savedSupplier.getId())
                .orElseThrow(() -> new AssertionError("Supplier should be found"));

        assertThat(foundSupplier).isNotNull();
        assertThat(foundSupplier.getName()).isEqualTo("Test Supplier DB");
        assertThat(foundSupplier.getEmail()).isEqualTo("test@supplier.com");
        assertThat(foundSupplier.getPhone()).isEqualTo("1234567890");
    }

    @Test
    void whenDatabaseIsEmpty_thenCountIsZero() {
        long count = testSupplierRepository.count();
        assertThat(count).isEqualTo(0);
    }
}
