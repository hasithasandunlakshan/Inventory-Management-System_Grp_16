-- Daily history for dashboards (keeps your snapshot table untouched)
CREATE TABLE IF NOT EXISTS supplier_scores_daily (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id BIGINT NOT NULL,
  score_date DATE NOT NULL,
  on_time_rate_30d DECIMAL(5,4) DEFAULT NULL,
  in_full_rate_30d DECIMAL(5,4) DEFAULT NULL,
  avg_late_days_30d DECIMAL(8,3) DEFAULT NULL,
  median_lead_time_90d DECIMAL(8,3) DEFAULT NULL,
  lead_time_iqr_90d DECIMAL(8,3) DEFAULT NULL,
  price_index_30d DECIMAL(8,3) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_supplier_scores_daily (supplier_id, score_date),
  INDEX idx_ssd_supplier (supplier_id),
  CONSTRAINT fk_ssd_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
) ENGINE=InnoDB;

-- Supplier-level feature store (for model training)
CREATE TABLE IF NOT EXISTS features_supplier_daily (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id BIGINT NOT NULL,
  feature_date DATE NOT NULL,
  otif_30d DECIMAL(5,4) DEFAULT NULL,
  late_rate_30d DECIMAL(5,4) DEFAULT NULL,
  spend_30d DECIMAL(15,2) DEFAULT NULL,
  open_po_count INT DEFAULT NULL,
  median_lead_time_90d DECIMAL(8,3) DEFAULT NULL,
  lead_time_iqr_90d DECIMAL(8,3) DEFAULT NULL,
  defect_rate_180d DECIMAL(5,4) DEFAULT NULL,
  dispute_rate_180d DECIMAL(5,4) DEFAULT NULL,
  price_index_30d DECIMAL(8,3) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_features_supplier_daily (supplier_id, feature_date),
  INDEX idx_fsd_supplier (supplier_id),
  CONSTRAINT fk_fsd_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
) ENGINE=InnoDB;

-- PO-level features captured at creation time (for predictions)
CREATE TABLE IF NOT EXISTS features_po_at_creation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  po_id BIGINT NOT NULL,
  supplier_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  total_amount DECIMAL(15,2) DEFAULT NULL,
  item_count INT DEFAULT NULL,
  item_mix_entropy DECIMAL(8,3) DEFAULT NULL,
  expected_lead_time_days DECIMAL(8,3) DEFAULT NULL,
  supplier_otif_90d DECIMAL(5,4) DEFAULT NULL,
  supplier_lead_time_var DECIMAL(12,6) DEFAULT NULL,
  month TINYINT DEFAULT NULL,
  weekday TINYINT DEFAULT NULL,
  created_row_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_features_po (po_id),
  INDEX idx_fpo_supplier (supplier_id),
  CONSTRAINT fk_fpo_po FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id),
  CONSTRAINT fk_fpo_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
) ENGINE=InnoDB;
