-- Drop tables in the correct order to handle foreign key constraints
DROP TABLE IF EXISTS delivery_logs;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS po_notes;
DROP TABLE IF EXISTS po_audit_entries;
DROP TABLE IF EXISTS po_attachments;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS supplier_categories;

-- Create tables in the correct order
CREATE TABLE users (
    user_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    password_hash VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20),
    formatted_address TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    date_of_birth DATE,
    profile_image_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_categories (
    category_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE suppliers (
    supplier_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_supplier_category FOREIGN KEY (category_id) REFERENCES supplier_categories(category_id) ON DELETE SET NULL
);

CREATE TABLE purchase_orders (
    po_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
);

CREATE TABLE purchase_order_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    CONSTRAINT fk_poitem_po FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE
);

CREATE TABLE po_notes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    CONSTRAINT fk_ponotes_po FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE
);

CREATE TABLE po_audit_entries (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    CONSTRAINT fk_poaudit_po FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE
);

CREATE TABLE po_attachments (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_content BLOB,
    uploaded_at TIMESTAMP NOT NULL,
    uploaded_by VARCHAR(100),
    CONSTRAINT fk_poattach_po FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE
);

CREATE TABLE delivery_logs (
    delivery_log_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    received_quantity INT NOT NULL,
    received_date DATE NOT NULL,
    CONSTRAINT fk_delivery_po FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE
);
