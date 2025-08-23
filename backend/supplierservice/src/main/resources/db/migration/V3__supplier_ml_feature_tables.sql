-- Suppliers: daily KPIs for dashboards (small & fast to read)
CREATE TABLE IF NOT EXISTS supplier_scores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id BIGINT NOT NULL,
  score_date DATE NOT NULL,
  on_time_rate_30d DECIMAL(5,4) DEFAULT NULL,       -- 0.0000–1.0000
  in_full_rate_30d DECIMAL(5,4) DEFAULT NULL,       -- 0.0000–1.0000
  avg_late_days_30d DECIMAL(8,3) DEFAULT NULL,      -- +/- days
  median_lead_time_90d DECIMAL(8,3) DEFAULT NULL,   -- days
  lead_time_iqr_90d DECIMAL(8,3) DEFAULT NULL,      -- days
  price_index_30d DECIMAL(8,3) DEFAULT NULL,        -- vs peer median (1.0 = median)
  segment VARCHAR(32) DEFAULT NULL,                 -- set in Phase 3
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_supplier_scores (supplier_id, score_date),
  INDEX idx_scores_supplier (supplier_id),
  CONSTRAINT fk_scores_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

-- Supplier feature store (richer set for model training)
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
  INDEX idx_features_supplier (supplier_id),
  CONSTRAINT fk_features_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

-- Features captured at PO creation time (for predictions like delay risk)
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
  month TINYINT DEFAULT NULL,         -- 1..12
  weekday TINYINT DEFAULT NULL,       -- 0..6
  created_row_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_features_po (po_id),
  INDEX idx_features_po_supplier (supplier_id),
  CONSTRAINT fk_features_po_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  CONSTRAINT fk_features_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;
