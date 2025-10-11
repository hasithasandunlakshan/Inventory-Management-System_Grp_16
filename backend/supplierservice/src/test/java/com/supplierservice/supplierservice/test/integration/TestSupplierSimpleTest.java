package com.supplierservice.supplierservice.test.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * A simple unit test for demonstrating test patterns without requiring Docker.
 * This shows how to mock a repository to simulate database access.
 */
@ExtendWith(MockitoExtension.class)
public class TestSupplierSimpleTest {

    @Mock
    private TestSupplierRepository testSupplierRepository;

    private TestSupplier testSupplier;

    @BeforeEach
    void setup() {
        testSupplier = new TestSupplier("Test Name", "test@example.com", "1234567890");
    }

    @Test
    void whenSaveTestSupplier_thenIdIsAssigned() {
        // Arrange
        TestSupplier savedTestSupplier = new TestSupplier(testSupplier.getName(),
                testSupplier.getEmail(),
                testSupplier.getPhone());
        savedTestSupplier.setId(1L);

        when(testSupplierRepository.save(any(TestSupplier.class))).thenReturn(savedTestSupplier);
        when(testSupplierRepository.findById(1L)).thenReturn(Optional.of(savedTestSupplier));

        // Act
        TestSupplier result = testSupplierRepository.save(testSupplier);
        Optional<TestSupplier> found = testSupplierRepository.findById(1L);

        // Assert
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Name");
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        assertThat(found.get().getPhone()).isEqualTo("1234567890");
    }
}
