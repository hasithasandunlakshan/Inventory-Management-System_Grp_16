
package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.*;
import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PurchaseOrderExtrasServiceTest {

    @Mock
    private PurchaseOrderRepository poRepo;
    @Mock
    private PurchaseOrderNoteRepository noteRepo;
    @Mock
    private PurchaseOrderAttachmentRepository attachmentRepo;
    @Mock
    private PurchaseOrderAuditRepository auditRepo;

    @InjectMocks
    private PurchaseOrderExtrasService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAudit_returnsAuditEntries() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        PurchaseOrderAuditEntry entry = PurchaseOrderAuditEntry.builder()
                .purchaseOrder(po)
                .action(AuditAction.NOTE_ADDED)
                .details("details")
                .createdAt(Instant.now())
                .createdBy("user")
                .build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(auditRepo.findByPurchaseOrder_PoIdOrderByCreatedAtDesc(poId)).thenReturn(List.of(entry));
        List<AuditEntryDTO> result = service.getAudit(poId);
        assertEquals(1, result.size());
        assertEquals("NOTE_ADDED", result.get(0).getAction());
    }

    @Test
    void addNote_success() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        NoteCreateDTO body = NoteCreateDTO.builder().text("Test note").createdBy("user").build();
        PurchaseOrderNote note = PurchaseOrderNote.builder().id(2L).purchaseOrder(po).text("Test note")
                .createdAt(Instant.now()).createdBy("user").build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(noteRepo.save(any())).thenReturn(note);
        when(auditRepo.save(any())).thenReturn(null);
        NoteDTO result = service.addNote(poId, body);
        assertEquals("Test note", result.getText());
        assertEquals("user", result.getCreatedBy());
    }

    @Test
    void addNote_blankText_throwsException() {
        Long poId = 1L;
        NoteCreateDTO body = NoteCreateDTO.builder().text(" ").createdBy("user").build();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.addNote(poId, body));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void listNotes_returnsNotes() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        PurchaseOrderNote note = PurchaseOrderNote.builder().id(2L).purchaseOrder(po).text("Test note")
                .createdAt(Instant.now()).createdBy("user").build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(noteRepo.findByPurchaseOrder_PoIdOrderByCreatedAtDesc(poId)).thenReturn(List.of(note));
        List<NoteDTO> result = service.listNotes(poId);
        assertEquals(1, result.size());
        assertEquals("Test note", result.get(0).getText());
    }

    @Test
    void uploadAttachment_success() throws IOException {
        Long poId = 1L;
        String uploadedBy = "user";
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getBytes()).thenReturn("data".getBytes());
        when(file.getOriginalFilename()).thenReturn("file.txt");
        when(file.getContentType()).thenReturn("text/plain");
        when(file.getSize()).thenReturn(4L);
        PurchaseOrderAttachment att = PurchaseOrderAttachment.builder().id(3L).purchaseOrder(po).filename("file.txt")
                .contentType("text/plain").sizeBytes(4L).data("data".getBytes()).uploadedAt(Instant.now())
                .uploadedBy(uploadedBy).build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(attachmentRepo.save(any())).thenReturn(att);
        when(auditRepo.save(any())).thenReturn(null);
        AttachmentDTO result = service.uploadAttachment(poId, file, uploadedBy);
        assertEquals("file.txt", result.getFilename());
        assertEquals("text/plain", result.getContentType());
        assertEquals(uploadedBy, result.getUploadedBy());
    }

    @Test
    void uploadAttachment_fileRequired() {
        Long poId = 1L;
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.uploadAttachment(poId, file, "user"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void getAttachmentForDownload_success() {
        Long poId = 1L;
        Long attId = 2L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        PurchaseOrderAttachment att = PurchaseOrderAttachment.builder().id(attId).purchaseOrder(po).build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(attachmentRepo.findByIdAndPurchaseOrder_PoId(attId, poId)).thenReturn(Optional.of(att));
        PurchaseOrderAttachment result = service.getAttachmentForDownload(poId, attId);
        assertEquals(attId, result.getId());
    }

    @Test
    void getAttachmentForDownload_notFound() {
        Long poId = 1L;
        Long attId = 2L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(attachmentRepo.findByIdAndPurchaseOrder_PoId(attId, poId)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.getAttachmentForDownload(poId, attId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void listAttachments_returnsList() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).build();
        PurchaseOrderAttachment att = PurchaseOrderAttachment.builder().id(3L).purchaseOrder(po).filename("file.txt")
                .contentType("text/plain").sizeBytes(4L).uploadedAt(Instant.now()).uploadedBy("user").build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(attachmentRepo.findByPurchaseOrder_PoIdOrderByUploadedAtDesc(poId)).thenReturn(List.of(att));
        List<AttachmentDTO> result = service.listAttachments(poId);
        assertEquals(1, result.size());
        assertEquals("file.txt", result.get(0).getFilename());
    }
}
