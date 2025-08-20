-- Attachments
CREATE TABLE IF NOT EXISTS po_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  po_id BIGINT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(255) NOT NULL,
  size_bytes BIGINT NOT NULL,
  data LONGBLOB NOT NULL,
  uploaded_at TIMESTAMP NOT NULL,
  uploaded_by VARCHAR(255),
  CONSTRAINT fk_po_attachments_po
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX idx_po_attachments_po ON po_attachments (po_id);
CREATE INDEX idx_po_attachments_uploaded_at ON po_attachments (uploaded_at);

-- Notes
CREATE TABLE IF NOT EXISTS po_notes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  po_id BIGINT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR(255),
  CONSTRAINT fk_po_notes_po
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX idx_po_notes_po ON po_notes (po_id);
CREATE INDEX idx_po_notes_created_at ON po_notes (created_at);

-- Audit entries
CREATE TABLE IF NOT EXISTS po_audit_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  po_id BIGINT NOT NULL,
  action VARCHAR(64) NOT NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR(255),
  CONSTRAINT fk_po_audit_po
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX idx_po_audit_po ON po_audit_entries (po_id);
CREATE INDEX idx_po_audit_created_at ON po_audit_entries (created_at);
