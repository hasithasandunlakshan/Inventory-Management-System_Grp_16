package com.supplierservice.supplierservice.dto;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class AuditEntryDTOTest {

    @Test
    void testNoArgsConstructorAndSetters() {
        AuditEntryDTO dto = new AuditEntryDTO();
        dto.setAction("CREATE");
        dto.setDetails("Created PO");
        Instant now = Instant.now();
        dto.setCreatedAt(now);
        dto.setCreatedBy("user1");

        assertEquals("CREATE", dto.getAction());
        assertEquals("Created PO", dto.getDetails());
        assertEquals(now, dto.getCreatedAt());
        assertEquals("user1", dto.getCreatedBy());
    }

    @Test
    void testAllArgsConstructor() {
        Instant now = Instant.now();
        AuditEntryDTO dto = new AuditEntryDTO("UPDATE", "Updated PO", now, "admin");
        assertEquals("UPDATE", dto.getAction());
        assertEquals("Updated PO", dto.getDetails());
        assertEquals(now, dto.getCreatedAt());
        assertEquals("admin", dto.getCreatedBy());
    }

    @Test
    void testBuilder() {
        Instant now = Instant.now();
        AuditEntryDTO dto = AuditEntryDTO.builder()
                .action("DELETE")
                .details("Deleted PO")
                .createdAt(now)
                .createdBy("builder")
                .build();
        assertEquals("DELETE", dto.getAction());
        assertEquals("Deleted PO", dto.getDetails());
        assertEquals(now, dto.getCreatedAt());
        assertEquals("builder", dto.getCreatedBy());
    }

    @Test
    void testEqualsAndHashCode() {
        Instant now = Instant.now();
        AuditEntryDTO dto1 = new AuditEntryDTO("ACTION", "Details", now, "user");
        AuditEntryDTO dto2 = new AuditEntryDTO("ACTION", "Details", now, "user");
        assertEquals(dto1, dto2);
        assertEquals(dto1.hashCode(), dto2.hashCode());
    }

    @Test
    void testToString() {
        Instant now = Instant.now();
        AuditEntryDTO dto = new AuditEntryDTO("ACTION2", "Details2", now, "user2");
        String str = dto.toString();
        assertTrue(str.contains("ACTION2"));
        assertTrue(str.contains("Details2"));
        assertTrue(str.contains("user2"));
    }
}
