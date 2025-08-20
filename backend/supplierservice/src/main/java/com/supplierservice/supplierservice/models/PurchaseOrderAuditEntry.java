package com.supplierservice.supplierservice.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "po_audit_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderAuditEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Column(columnDefinition = "TEXT")
    private String details; // free-form JSON/text

    @Column(nullable = false)
    private Instant createdAt;

    private String createdBy; // optional (user/service)
}
