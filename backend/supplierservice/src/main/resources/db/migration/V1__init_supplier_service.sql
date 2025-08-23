-- 1) Categories
CREATE TABLE IF NOT EXISTS supplier_categories (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(120) NOT NULL UNIQUE,
  description  VARCHAR(255)
) ENGINE=InnoDB;

-- 2) Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  contact_info  VARCHAR(255),
  category_id   BIGINT,
  CONSTRAINT fk_suppliers_category
    FOREIGN KEY (category_id) REFERENCES supplier_categories(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_category ON suppliers(category_id);

-- 3) Purchase Order (header)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id   BIGINT NOT NULL,
  order_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('PENDING','APPROVED','REJECTED','PARTIALLY_DELIVERED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  notes         VARCHAR(500),
  CONSTRAINT fk_po_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status_date ON purchase_orders(status, order_date);

-- 4) Purchase Order Items (detail)
-- If items reference your inventory service product IDs, store just the product_id (FK optional if cross-service)
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                BIGINT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id BIGINT NOT NULL,
  product_id        BIGINT NOT NULL,
  quantity          INT NOT NULL CHECK (quantity > 0),
  unit_price        DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
  CONSTRAINT fk_poi_po
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_poi_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_poi_product ON purchase_order_items(product_id);

-- 5) Delivery Logs
CREATE TABLE IF NOT EXISTS delivery_logs (
  id                BIGINT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id BIGINT NOT NULL,
  delivered_qty     INT NOT NULL CHECK (delivered_qty >= 0),
  delivery_date     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks           VARCHAR(255),
  CONSTRAINT fk_dl_po
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_dl_po_date ON delivery_logs(purchase_order_id, delivery_date);

-- 6) Supplier Scores (optional analytics)
CREATE TABLE IF NOT EXISTS supplier_scores (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id   BIGINT NOT NULL,
  score_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  on_time_score DECIMAL(5,2),     -- 0..100
  quality_score DECIMAL(5,2),     -- 0..100
  overall_score DECIMAL(5,2),     -- weighted or computed
  CONSTRAINT fk_ss_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_ss_supplier_date ON supplier_scores(supplier_id, score_date);
