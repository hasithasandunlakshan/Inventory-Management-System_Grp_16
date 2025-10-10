package com.supplierservice.supplierservice.dto;

import org.junit.jupiter.api.Test;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class AttachmentDTOTest {

    @Test
    void testNoArgsConstructorAndSetters() {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(1L);
        dto.setFilename("file.txt");
        dto.setContentType("text/plain");
        dto.setSizeBytes(123L);
        Instant now = Instant.now();
        dto.setUploadedAt(now);
        dto.setUploadedBy("user1");

        assertEquals(1L, dto.getId());
        assertEquals("file.txt", dto.getFilename());
        assertEquals("text/plain", dto.getContentType());
        assertEquals(123L, dto.getSizeBytes());
        assertEquals(now, dto.getUploadedAt());
        assertEquals("user1", dto.getUploadedBy());
    }

    @Test
    void testAllArgsConstructor() {
        Instant now = Instant.now();
        AttachmentDTO dto = new AttachmentDTO(2L, "a.pdf", "application/pdf", 456L, now, "admin");
        assertEquals(2L, dto.getId());
        assertEquals("a.pdf", dto.getFilename());
        assertEquals("application/pdf", dto.getContentType());
        assertEquals(456L, dto.getSizeBytes());
        assertEquals(now, dto.getUploadedAt());
        assertEquals("admin", dto.getUploadedBy());
    }

    @Test
    void testBuilder() {
        Instant now = Instant.now();
        AttachmentDTO dto = AttachmentDTO.builder()
                .id(3L)
                .filename("b.docx")
                .contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                .sizeBytes(789L)
                .uploadedAt(now)
                .uploadedBy("builder")
                .build();
        assertEquals(3L, dto.getId());
        assertEquals("b.docx", dto.getFilename());
        assertEquals("application/vnd.openxmlformats-officedocument.wordprocessingml.document", dto.getContentType());
        assertEquals(789L, dto.getSizeBytes());
        assertEquals(now, dto.getUploadedAt());
        assertEquals("builder", dto.getUploadedBy());
    }

    @Test
    void testEqualsAndHashCode() {
        Instant now = Instant.now();
        AttachmentDTO dto1 = new AttachmentDTO(4L, "c.txt", "text/plain", 100L, now, "user");
        AttachmentDTO dto2 = new AttachmentDTO(4L, "c.txt", "text/plain", 100L, now, "user");
        assertEquals(dto1, dto2);
        assertEquals(dto1.hashCode(), dto2.hashCode());
    }

    @Test
    void testToString() {
        Instant now = Instant.now();
        AttachmentDTO dto = new AttachmentDTO(5L, "d.txt", "text/plain", 200L, now, "user2");
        String str = dto.toString();
        assertTrue(str.contains("5"));
        assertTrue(str.contains("d.txt"));
        assertTrue(str.contains("text/plain"));
        assertTrue(str.contains("200"));
        assertTrue(str.contains("user2"));
    }
}
