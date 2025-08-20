package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.*;
import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
public class PurchaseOrderExtrasService {

    private final PurchaseOrderRepository poRepo;
    private final PurchaseOrderNoteRepository noteRepo;
    private final PurchaseOrderAttachmentRepository attachmentRepo;
    private final PurchaseOrderAuditRepository auditRepo;

    public PurchaseOrderExtrasService(PurchaseOrderRepository poRepo,
            PurchaseOrderNoteRepository noteRepo,
            PurchaseOrderAttachmentRepository attachmentRepo,
            PurchaseOrderAuditRepository auditRepo) {
        this.poRepo = poRepo;
        this.noteRepo = noteRepo;
        this.attachmentRepo = attachmentRepo;
        this.auditRepo = auditRepo;
    }

    // ===== Audit =====
    @Transactional(readOnly = true)
    public List<AuditEntryDTO> getAudit(Long poId) {
        ensurePOExists(poId);
        return auditRepo.findByPurchaseOrder_PoIdOrderByCreatedAtDesc(poId).stream()
                .map(a -> AuditEntryDTO.builder()
                        .action(a.getAction().name())
                        .details(a.getDetails())
                        .createdAt(a.getCreatedAt())
                        .createdBy(a.getCreatedBy())
                        .build())
                .toList();
    }

    // Helper to record audit (call from within this service or other services)
    @Transactional
    public void recordAudit(Long poId, AuditAction action, String details, String actor) {
        PurchaseOrder po = ensurePOExists(poId);
        var entry = PurchaseOrderAuditEntry.builder()
                .purchaseOrder(po)
                .action(action)
                .details(details)
                .createdAt(Instant.now())
                .createdBy(actor)
                .build();
        auditRepo.save(entry);
    }

    // ===== Notes =====
    @Transactional
    public NoteDTO addNote(Long poId, NoteCreateDTO body) {
        if (body == null || body.getText() == null || body.getText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Note text is required");
        }
        PurchaseOrder po = ensurePOExists(poId);
        var note = PurchaseOrderNote.builder()
                .purchaseOrder(po)
                .text(body.getText())
                .createdAt(Instant.now())
                .createdBy(body.getCreatedBy())
                .build();
        var saved = noteRepo.save(note);

        // audit
        recordAudit(poId, AuditAction.NOTE_ADDED, truncate("note: " + body.getText(), 500), body.getCreatedBy());

        return NoteDTO.builder()
                .id(saved.getId())
                .text(saved.getText())
                .createdAt(saved.getCreatedAt())
                .createdBy(saved.getCreatedBy())
                .build();
    }

    @Transactional(readOnly = true)
    public List<NoteDTO> listNotes(Long poId) {
        ensurePOExists(poId);
        return noteRepo.findByPurchaseOrder_PoIdOrderByCreatedAtDesc(poId).stream()
                .map(n -> NoteDTO.builder()
                        .id(n.getId())
                        .text(n.getText())
                        .createdAt(n.getCreatedAt())
                        .createdBy(n.getCreatedBy())
                        .build())
                .toList();
    }

    // ===== Attachments =====
    @Transactional
    public AttachmentDTO uploadAttachment(Long poId, MultipartFile file, String uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        PurchaseOrder po = ensurePOExists(poId);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read file");
        }

        var att = PurchaseOrderAttachment.builder()
                .purchaseOrder(po)
                .filename(file.getOriginalFilename())
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .sizeBytes(file.getSize())
                .data(bytes)
                .uploadedAt(Instant.now())
                .uploadedBy(uploadedBy)
                .build();

        var saved = attachmentRepo.save(att);

        // audit
        recordAudit(poId, AuditAction.ATTACHMENT_ADDED,
                "filename=" + saved.getFilename() + ", size=" + saved.getSizeBytes(), uploadedBy);

        return AttachmentDTO.builder()
                .id(saved.getId())
                .filename(saved.getFilename())
                .contentType(saved.getContentType())
                .sizeBytes(saved.getSizeBytes())
                .uploadedAt(saved.getUploadedAt())
                .uploadedBy(saved.getUploadedBy())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttachmentDTO> listAttachments(Long poId) {
        ensurePOExists(poId);
        return attachmentRepo.findByPurchaseOrder_PoIdOrderByUploadedAtDesc(poId).stream()
                .map(a -> AttachmentDTO.builder()
                        .id(a.getId())
                        .filename(a.getFilename())
                        .contentType(a.getContentType())
                        .sizeBytes(a.getSizeBytes())
                        .uploadedAt(a.getUploadedAt())
                        .uploadedBy(a.getUploadedBy())
                        .build())
                .toList();
    }

    // ===== helpers =====
    private PurchaseOrder ensurePOExists(Long poId) {
        return poRepo.findById(poId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase order not found: " + poId));
    }

    private String truncate(String s, int max) {
        if (s == null)
            return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
