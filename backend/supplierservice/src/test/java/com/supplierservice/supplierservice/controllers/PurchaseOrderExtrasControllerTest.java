package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.AttachmentDTO;
import com.supplierservice.supplierservice.dto.AuditEntryDTO;
import com.supplierservice.supplierservice.dto.NoteCreateDTO;
import com.supplierservice.supplierservice.dto.NoteDTO;
import com.supplierservice.supplierservice.models.PurchaseOrderAttachment;
import com.supplierservice.supplierservice.services.PurchaseOrderExtrasService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PurchaseOrderExtrasControllerTest {
    @Mock
    private PurchaseOrderExtrasService extrasService;

    @InjectMocks
    private PurchaseOrderExtrasController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void audit_returnsAuditList() {
        AuditEntryDTO entry = AuditEntryDTO.builder()
                .action("CREATE")
                .details("Test audit")
                .createdAt(java.time.Instant.now())
                .createdBy("test-user")
                .build();
        List<AuditEntryDTO> auditList = Collections.singletonList(entry);
        when(extrasService.getAudit(1L)).thenReturn(auditList);
        ResponseEntity<List<AuditEntryDTO>> response = controller.audit(1L);
        assertEquals(auditList, response.getBody());
        assertEquals(200, response.getStatusCode().value());
        verify(extrasService).getAudit(1L);
    }

    @Test
    void addNote_returnsNote() {
        NoteCreateDTO createDTO = new NoteCreateDTO();
        NoteDTO noteDTO = new NoteDTO();
        when(extrasService.addNote(eq(1L), any())).thenReturn(noteDTO);
        ResponseEntity<NoteDTO> response = controller.addNote(1L, createDTO);
        assertEquals(noteDTO, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void listNotes_returnsNotes() {
        List<NoteDTO> notes = Arrays.asList(new NoteDTO(), new NoteDTO());
        when(extrasService.listNotes(1L)).thenReturn(notes);
        ResponseEntity<List<NoteDTO>> response = controller.listNotes(1L);
        assertEquals(notes, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void uploadAttachment_returnsAttachment() {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", MediaType.TEXT_PLAIN_VALUE,
                "data".getBytes());
        AttachmentDTO attachmentDTO = new AttachmentDTO();
        when(extrasService.uploadAttachment(eq(1L), any(), any())).thenReturn(attachmentDTO);
        ResponseEntity<AttachmentDTO> response = controller.uploadAttachment(1L, file, "user1");
        assertEquals(attachmentDTO, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void listAttachments_returnsAttachments() {
        List<AttachmentDTO> attachments = Arrays.asList(new AttachmentDTO(), new AttachmentDTO());
        when(extrasService.listAttachments(1L)).thenReturn(attachments);
        ResponseEntity<List<AttachmentDTO>> response = controller.listAttachments(1L);
        assertEquals(attachments, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void downloadAttachment_returnsFileWithHeaders() {
        PurchaseOrderAttachment attachment = mock(PurchaseOrderAttachment.class);
        when(attachment.getFilename()).thenReturn("file.txt");
        when(attachment.getContentType()).thenReturn(MediaType.TEXT_PLAIN_VALUE);
        when(attachment.getSizeBytes()).thenReturn(4L);
        when(attachment.getData()).thenReturn("data".getBytes());
        when(extrasService.getAttachmentForDownload(1L, 2L)).thenReturn(attachment);

        ResponseEntity<byte[]> response = controller.downloadAttachment(1L, 2L);
        assertArrayEquals("data".getBytes(), response.getBody());
        assertEquals("attachment; filename=\"file.txt\"",
                response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION));
        assertEquals(MediaType.TEXT_PLAIN_VALUE, response.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE));
        assertEquals("4", response.getHeaders().getFirst(HttpHeaders.CONTENT_LENGTH));
        assertEquals(200, response.getStatusCode().value());
    }
}
