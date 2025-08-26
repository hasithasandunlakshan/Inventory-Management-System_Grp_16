-- Add FKs to the ML tables
-- Assumes:
--   suppliers.supplier_id (PK)
--   purchase_orders.po_id (PK)
-- If your purchase_orders PK is `id`, use the commented variant below.

-- Ensure we use InnoDB FK behavior
SET SESSION foreign_key_checks = 1;

-- supplier_scores_daily → suppliers
ALTER TABLE supplier_scores_daily
  ADD CONSTRAINT fk_ssd_supplier
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- features_supplier_daily → suppliers
ALTER TABLE features_supplier_daily
  ADD CONSTRAINT fk_fsd_supplier
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- features_po_at_creation → suppliers
ALTER TABLE features_po_at_creation
  ADD CONSTRAINT fk_fpo_supplier
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- features_po_at_creation → purchase_orders
-- Default (if PK is po_id):
ALTER TABLE features_po_at_creation
  ADD CONSTRAINT fk_fpo_po
  FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- If your purchase_orders PK is `id`, comment the block above and use this instead:
-- ALTER TABLE features_po_at_creation
--   ADD CONSTRAINT fk_fpo_po
--   FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
--   ON UPDATE CASCADE ON DELETE RESTRICT;
