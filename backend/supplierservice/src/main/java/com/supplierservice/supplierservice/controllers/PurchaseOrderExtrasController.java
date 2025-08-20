package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.*;
import com.supplierservice.supplierservice.services.PurchaseOrderExtrasService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders/{poId}")
public class PurchaseOrderExtrasController {

    private final PurchaseOrderExtrasService extrasService;

    public PurchaseOrderExtrasController(PurchaseOrderExtrasService extrasService) {
        this.extrasService = extrasService;
    }

    // GET /api/purchase-orders/{id}/audit
    @GetMapping("/audit")
    public ResponseEntity<List<AuditEntryDTO>> audit(@PathVariable("poId") Long poId) {
        return ResponseEntity.ok(extrasService.getAudit(poId));
    }

    // POST /api/purchase-orders/{id}/notes
    @PostMapping("/notes")
    public ResponseEntity<NoteDTO> addNote(@PathVariable("poId") Long poId,
            @RequestBody NoteCreateDTO body) {
        return ResponseEntity.ok(extrasService.addNote(poId, body));
    }

    // GET /api/purchase-orders/{id}/notes
    @GetMapping("/notes")
    public ResponseEntity<List<NoteDTO>> listNotes(@PathVariable("poId") Long poId) {
        return ResponseEntity.ok(extrasService.listNotes(poId));
    }

    // POST /api/purchase-orders/{id}/attachments
    @PostMapping(value = "/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentDTO> uploadAttachment(@PathVariable("poId") Long poId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy) {
        return ResponseEntity.ok(extrasService.uploadAttachment(poId, file, uploadedBy));
    }

    // GET /api/purchase-orders/{id}/attachments
    @GetMapping("/attachments")
    public ResponseEntity<List<AttachmentDTO>> listAttachments(@PathVariable("poId") Long poId) {
        return ResponseEntity.ok(extrasService.listAttachments(poId));
    }
}
